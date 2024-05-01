import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderEnum } from 'src/core/dto/pagination.dto';

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

class DurationLength {
  start: number;
  end: number;
}
export class JobSearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  field: string;

  @ApiProperty({ required: false })
  @IsOptional()
  duration: DurationLength;

  @ApiProperty({ type: 'enum', enum: OrderEnum, required: false })
  @IsOptional()
  @IsEnum(OrderEnum)
  orderBy: OrderEnum;
}

export class UpdateStudentProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  bio: string;

  @ApiProperty({ required: false })
  @IsOptional()
  password: string;
}

export class StudentOnboarding {
  @ApiProperty()
  matNo: string;

  @ApiProperty()
  school: string;
}
