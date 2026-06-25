import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  targetUsername: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
