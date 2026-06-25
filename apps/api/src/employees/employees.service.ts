import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateEmployeeDto, UpdateEmployeeStatusDto, FaceEnrollDto } from './dto/employee.dto';
import { FACE_RECOGNITION_PROVIDER, FaceRecognitionProvider } from '../ai/interfaces/face-recognition-provider.interface';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(FACE_RECOGNITION_PROVIDER)
    private readonly faceRecognition: FaceRecognitionProvider,
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

  async faceEnroll(id: string, dto: FaceEnrollDto, actorId: string) {
    const { faceEmbeddingId } = await this.faceRecognition.enroll(id, dto.photoUrl);
    const employee = await this.prisma.employee.update({
      where: { id },
      data: { faceEmbeddingId, photoUrl: dto.photoUrl },
    });
    await this.audit.log({
      action: 'EMPLOYEE_FACE_ENROLLED',
      entity: 'Employee',
      entityId: employee.id,
      userId: actorId,
    });
    return employee;
  }
}
