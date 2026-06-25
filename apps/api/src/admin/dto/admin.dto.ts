import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@kitchenos/db';

const ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF];

export class CreateUserDto {
  @IsString()
  username: string;

  @MinLength(8)
  password: string;

  @IsIn(ROLES)
  role: Role;
}

export class UpdateUserDto {
  @IsOptional()
  @IsIn(ROLES)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
