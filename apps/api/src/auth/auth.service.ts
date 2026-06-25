import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@kitchenos/db';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { OtpService } from './otp.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly otp: OtpService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      if (!dto.otp) {
        return { requiresOtp: true };
      }
      const otpOk = this.otp.verify(user.twoFactorSecret ?? user.id, dto.otp);
      if (!otpOk) {
        throw new UnauthorizedException('Invalid OTP');
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.audit.log({
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
    });

    const accessToken = this.jwt.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      accessToken,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }

  /**
   * Per spec: passwords can ONLY be changed by a Super Admin (for any account,
   * including their own). Regular admins/staff cannot self-service this.
   */
  async changePassword(actorRole: Role, dto: ChangePasswordDto) {
    if (actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only a Super Admin can change passwords');
    }

    const target = await this.prisma.user.findUnique({
      where: { username: dto.targetUsername },
    });
    if (!target) {
      throw new BadRequestException('User not found');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: target.id },
      data: { passwordHash },
    });

    await this.audit.log({
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: target.id,
    });

    return { success: true };
  }
}
