import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateEmployeeDto, UpdateEmployeeStatusDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(departmentId?: string) {
    return this.prisma.employee.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: { department: true, shift: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.employee.findUniqueOrThrow({
      where: { id },
      include: { department: true, shift: true },
    });
  }

  async create(dto: CreateEmployeeDto, actorId: string) {
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode: dto.employeeCode,
        name: dto.name,
        mobileNumber: dto.mobileNumber,
        emergencyContact: dto.emergencyContact,
        joiningDate: new Date(dto.joiningDate),
        departmentId: dto.departmentId,
        shiftId: dto.shiftId,
        photoUrl: dto.photoUrl,
      },
    });
    await this.audit.log({
      action: 'EMPLOYEE_CREATED',
      entity: 'Employee',
      entityId: employee.id,
      userId: actorId,
    });
    return employee;
  }

  async updateStatus(id: string, dto: UpdateEmployeeStatusDto, actorId: string) {
    const employee = await this.prisma.employee.update({
      where: { id },
      data: { status: dto.status },
    });
    await this.audit.log({
      action: 'EMPLOYEE_STATUS_CHANGED',
      entity: 'Employee',
      entityId: employee.id,
      userId: actorId,
      metadata: { status: dto.status },
    });
    return employee;
  }
}
