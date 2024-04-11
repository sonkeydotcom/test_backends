import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './utils/auth.jwt-strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './decorator/jwt-auth-guard.decorator';
import { Company } from 'src/company/entity/company.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, {
    provide: APP_GUARD, useClass:  JwtAuthGuard
  }, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: false,
        secret: configService.get('JWT_KEY'),
        signOptions: {
          expiresIn: configService.get('JWT_TIME'),
        },
      }),
    }),
  ],
  exports: [PassportModule, JwtStrategy, AuthService]
})
export class AuthModule {}
