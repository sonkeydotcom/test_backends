import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../entities/users.entity';

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
