import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class StudentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  searching: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  accepted: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  shortlisted: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  applied: boolean;
}
