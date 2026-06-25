import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { EmployeeStatus } from '@kitchenos/db';

export class CreateEmployeeDto {
  @IsString()
  employeeCode: string;

  @IsString()
  name: string;

  @IsString()
  mobileNumber: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsDateString()
  joiningDate: string;

  @IsString()
  departmentId: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class UpdateEmployeeStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE'])
  status: EmployeeStatus;
}

export class FaceEnrollDto {
  @IsString()
  photoUrl: string;
}
