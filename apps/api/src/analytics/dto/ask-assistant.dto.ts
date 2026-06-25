import { IsNotEmpty, IsString } from 'class-validator';

export class AskAssistantDto {
  @IsString()
  @IsNotEmpty()
  question!: string;
}
