import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/users.entity';
import { Repository } from 'typeorm';
import { JWTBody } from './utils/auth.types';
import { coreErrorHelper } from 'src/core/helpers/error.helper';
import { compareHash, encryptString } from 'src/core/helpers/encrypt.helper';
import { userLoginDto } from './dto/auth.user.dto';
import { Company } from 'src/company/entity/company.entity';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';

@Injectable()
export class AuthService {
  async validateGetUserOnReq(payload: JWTBody): Promise<User | Company> {
    try {
      // TODO! check for the student too, to validate their request
      const { email, role } = payload;
      if (role === UserRole.USER) {
        const user: User = await this.userRepository.findOne({
          where: {
            email,
          },
          cache: true,
        });
        if (!user) {
          throw new UnauthorizedException('not found, not authorized');
        }
        return user;
      } else {
        const company: Company = await this.companyRepository.findOne({
          where: {
            email,
          },
        });
        if (!Company) {
          throw new UnauthorizedException('not found, not authorized');
        }
        return company;
      }
    } catch (error) {
      return coreErrorHelper(error);
    }
  }
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  public generateAuthToken({
    email,
    userId,
    role,
  }: {
    email: string;
    userId: string;
    role: UserRole;
  }): Promise<string> {
    const payload: JWTBody = {
      email: email,
      userId: userId,
      role: role,
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
        throw new NotFoundException(
          'the email address or password does not exist',
        );
      }
      const comparePassword = await compareHash(password, getUser?.password);
      if (!comparePassword) {
        throw new ForbiddenException('the password or email is incorrect');
      }
      const token = await this.generateAuthToken({
        email: getUser?.email,
        userId: getUser?.userId,
        role: getUser.role,
      });
      // send notification maybe if needed
      return {
        statusCode: HttpStatus.OK,
        message: 'login successful',
        data: {
          accessToken: token,
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

  async createUserAccount(dto: userLoginDto): Promise<globalApiResponseDto> {
    try {
      const { email, password } = dto;
      const getUser = await this.FindOneUser(email);
      if (getUser) {
        throw new ForbiddenException('user with email already exist');
      }

      const createUser = this.userRepository.create({
        email,
        password: await encryptString(password),
      });
      await this.userRepository.save(createUser);
      return {
        message: 'successful',
        data: createUser,
        statusCode: HttpStatus.CREATED,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }
}
