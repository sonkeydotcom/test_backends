import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

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

export class companyLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  rc_number: string;
}
