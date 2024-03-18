import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import { JWTBody } from './utils/auth.types';
import { coreErrorHelper } from 'src/core/helpers/error.helper';
import { compareHash } from 'src/core/helpers/encrypt.helper';
import { userLoginDto } from './dto/auth.user.dto';

@Injectable()
export class AuthService {
  async validateGetUserOnReq(payload: JWTBody): Promise<User> {
    try {
      const { email } = payload;
      const user: User = await this.userRepository.findOne({
        where: {
          email,
        },
        cache: true,
      });
      if (!user) {
        throw new UnauthorizedException(
          'you details cannot be found, not authorized',
        );
      }
      return user;
    } catch (error) {
      return coreErrorHelper(error);
    }
  }
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public generateAuthToken({
    email,
    userId,
  }: {
    email: string;
    userId: string;
  }): Promise<string> {
    const payload: JWTBody = {
      email: email,
      userId: userId,
    };
    return this.jwtService.signAsync(payload);
  }

  public verifyAuthToken(token: string) {
    try {
      this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_KEY'),
      });
    } catch (err) {
      throw new UnauthorizedException('failed to verify auth payload');
    }
  }

  async loginUser(dto: userLoginDto) {
    try {
      const { email, password } = dto;

      const getUser = await this.FindOneUser(email);
      if (!getUser) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message:
            'your email lookup does not match an existing profile, kindly signup',
        };
      }
      const comparePassword = await compareHash(password, getUser?.password);
      if (!comparePassword) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message:
            'your password is incorrect, kindly request forget password or input the correct one',
        };
      }
      const token = await this.generateAuthToken({
        email: getUser?.email,
        userId: getUser?.userId,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'login successful',
        data: {
          token: token,
          user: getUser,
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async FindOneUser(email: string): Promise<User> {
    try {
      const getUser = await this.userRepository.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });
      return getUser;
    } catch (err) {
      return coreErrorHelper(err);
    }
  }
}
