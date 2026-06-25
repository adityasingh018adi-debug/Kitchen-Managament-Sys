import { IsString, Length } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  @Length(4, 8)
  pin: string;
}

export class UpdatePinDto {
  @IsString()
  @Length(4, 8)
  pin: string;
}
