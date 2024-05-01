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
  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty()
  duration: DurationLength;

  @ApiProperty({ type: 'enum', enum: OrderEnum })
  @IsEnum(OrderEnum)
  orderBy: OrderEnum;
}
