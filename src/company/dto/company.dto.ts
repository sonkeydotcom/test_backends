import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class companyDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  company_name: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  rc_number: string;

  @ApiProperty()
  @IsString()
  year_founded: string;

  @ApiProperty()
  student_capacity: number;

  @ApiProperty()
  it_duration: number;

  @ApiProperty()
  address: string;
}

export class UpdateCompanyProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  phone: number;

  @ApiProperty({ required: false })
  @IsOptional()
  website: string;

  @ApiProperty({ required: false })
  @IsOptional()
  address: string;
}

export class companyLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rc_number?: string;
}
