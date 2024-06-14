import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/users.entity';
// import { Company } from 'src/company/entity/company.entity';
// import { UserRole } from '../entities/users.entity';

export class userLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

// export class signUpDto {
//   @ApiProperty()
//   @IsEmail()
//   email: string;

//   @ApiProperty()
//   @IsString()
//   password: string;

//   @ApiProperty()
//     @IsEnum()
//   role: UserRole
// }

class authResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  companyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  matriculationNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phoneNumber: string;
}

export class getAuthUserResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  data: authResponse;

  @ApiProperty()
  statusCode: number;
}
