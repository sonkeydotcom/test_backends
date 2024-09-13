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
import { getAuthUserResponseDto, userLoginDto } from './dto/auth.user.dto';
import { Company } from 'src/company/entity/company.entity';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';
import { Student } from 'src/students/entity/student.entity';
import { CreateStudentDto } from 'src/students/dto/student.dto';

@Injectable()
export class AuthService {
  async validateGetUserOnReq(
    payload: JWTBody,
  ): Promise<User | Company | Student> {
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
      } else if (role === UserRole.COMPANY) {
        const company: Company = await this.companyRepository.findOne({
          where: {
            email,
          },
        });
        if (!Company) {
          throw new UnauthorizedException('not found, not authorized');
        }
        return company;
      } else {
        const student: Student = await this.studentRepository.findOne({
          where: {
            email,
          },
        });
        if (!student) {
          throw new UnauthorizedException('not found, not authorized');
        }
        return student;
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
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
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

  async loginUser(dto: userLoginDto, student: boolean) {
    try {
      const { email, password } = dto;

      if (student) {
        const findStudent = await this.studentRepository.findOne({
          where: {
            email: email.toLowerCase(),
          },
        });
        if (!findStudent) {
          throw new ForbiddenException(
            'student email not found or does not exist',
          );
        }
        const checkPassword = await compareHash(
          password,
          findStudent?.password,
        );
        if (!checkPassword) {
          throw new ForbiddenException('the password or email is incorrect');
        }
        const token = await this.generateAuthToken({
          email: findStudent?.email,
          userId: findStudent?.id,
          role: findStudent.role,
        });
        // send notification maybe if needed
        return {
          statusCode: HttpStatus.OK,
          message: 'login successful',
          data: {
            accessToken: token,
            user: findStudent,
          },
        };
      }
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

  async createStudentAccount(
    dto: CreateStudentDto,
  ): Promise<globalApiResponseDto> {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        matriculationNumber,
        school,
      } = dto;
      const findStudent = await this.studentRepository.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });
      if (findStudent) {
        throw new ForbiddenException('student email already exist');
      }

      const createStudent = this.studentRepository.create({
        email,
        firstName,
        lastName,
        matriculationNumber,
        school,
        password: await encryptString(password),
      });
      await this.studentRepository.save(createStudent);
      return {
        message: 'successful',
        data: createStudent,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      return coreErrorHelper(error);
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

  async getCurrentAuthUser(
    user?: User,
    company?: Company,
    student?: Student,
  ): Promise<getAuthUserResponseDto> {
    try {
      return {
        message: 'getting current auth user successful',
        statusCode: HttpStatus.OK,
        data: {
          id: user?.userId ?? company?.id ?? student?.id,
          email: user?.email ?? company?.email ?? student?.email,
          name:
            company?.name ??
            `${student?.firstName} ${student?.firstName}` ??
            null,
          matriculationNumber: student?.matriculationNumber ?? null,
          phoneNumber: student?.phoneNumber ?? null,
          role: student?.role ?? company?.role ?? user?.role,
          companyId: company?.id ?? null,
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async runHealthCheck(): Promise<globalApiResponseDto> {
    console.log(
      '=========================== Health Check ============================',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'successful and alive',
    };
  }
}
