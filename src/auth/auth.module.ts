import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './utils/auth.jwt-strategy';
import { Company } from 'src/company/entity/company.entity';
import { Student } from 'src/students/entity/student.entity';
import { MailerConfigModule } from 'src/email/mailer.module';
import { MailService } from 'src/email/mailer.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService],
  imports: [
    TypeOrmModule.forFeature([User, Company, Student]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_KEY'),
        signOptions: {
          expiresIn: configService.get('JWT_TIME'),
        },
      }),
    }),
    MailerConfigModule,
  ],
  exports: [AuthService, PassportModule, JwtStrategy],
})
export class AuthModule {}
