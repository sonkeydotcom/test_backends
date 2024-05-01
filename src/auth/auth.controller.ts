import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userLoginDto } from './dto/auth.user.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  handleLogin(@Body() dto: userLoginDto) {
    return this.authService.loginUser(dto);
  }

  @Post('signup')
  handleAccountCreation(@Body() dto: userLoginDto) {
    return this.authService.createUserAccount(dto);
  }
}
