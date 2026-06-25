import { IsIn, IsOptional, IsString, IsNumber } from 'class-validator';
import { AttendanceEventType } from '@kitchenos/db';

const TYPES: AttendanceEventType[] = ['PUNCH_IN', 'PUNCH_OUT', 'BREAK_START', 'BREAK_END'];

export class PunchDto {
  @IsString()
  employeeId: string;

  @IsIn(TYPES)
  type: AttendanceEventType;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsNumber()
  gpsLat?: number;

  @IsOptional()
  @IsNumber()
  gpsLng?: number;

  @IsOptional()
  @IsString()
  device?: string;
}

export class RecognizeDto {
  @IsString()
  photoUrl: string;
}
