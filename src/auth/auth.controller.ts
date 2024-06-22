import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { getAuthUserResponseDto, userLoginDto } from './dto/auth.user.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetCompany,
  GetStudent,
  GetUser,
} from './decorator/get-user.decorator';
import { User } from './entities/users.entity';
import { Company } from 'src/company/entity/company.entity';
import { Student } from 'src/students/entity/student.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/health')
  cronHealthCheck() {
    return this.authService.runHealthCheck();
  }

  @Post('/login')
  handleLogin(@Body() dto: userLoginDto, @Body() student: boolean) {
    return this.authService.loginUser(dto, student);
  }

  @Post('signup')
  handleAccountCreation(@Body() dto: userLoginDto) {
    return this.authService.createUserAccount(dto);
  }

  @ApiResponse({
    description: 'returns the current auth user',
    type: getAuthUserResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/me')
  getCurrentAuthUser(
    @GetUser() user: User,
    @GetCompany() company: Company,
    @GetStudent() student: Student,
  ) {
    return this.authService.getCurrentAuthUser(user, company, student);
  }
}
