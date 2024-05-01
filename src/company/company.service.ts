import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { Repository } from 'typeorm';
import { companyDto, companyLoginDto } from './dto/company.dto';
import { coreErrorHelper } from 'src/core/helpers/error.helper';
import { compareHash, encryptString } from 'src/core/helpers/encrypt.helper';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';
import { Jobs } from './entity/jobs.entity';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { globalPaginationHelper } from 'src/core/helpers/paginationHelper';
import { CreateJobDto } from './dto/jobs.dto';
import { AcceptedApplicants } from './entity/accepted-applicant.entity';
import { ShortlistedApplicant } from './entity/shortlisted-applicant.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Jobs)
    private jobRepository: Repository<Jobs>,
    @InjectRepository(AcceptedApplicants)
    private acceptedApplicantsRepository: Repository<AcceptedApplicants>,
    @InjectRepository(ShortlistedApplicant)
    private shortedListedApplicantsRepository: Repository<ShortlistedApplicant>,
    private authService: AuthService,
  ) {}

  async createCompanyAccount(dto: companyDto) {
    try {
      const checkIf = await this.companyRepository.findOne({
        where: {
          email: dto.email.toLowerCase(),
        },
      });

      if (checkIf) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'the company account already exist',
        };
      }

      const createCompany = this.companyRepository.create({
        address: dto.address,
        companyId: dto.companyId,
        email: dto.email,
        password: await encryptString(dto.password),
        rc_number: dto.rc_number,
        name: dto.company_name,
        year_founded: dto.year_founded,
      });
      const token = await this.authService.generateAuthToken({
        email: createCompany.email,
        userId: createCompany.id,
        role: createCompany.role,
      });
      await this.companyRepository.save(createCompany);
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          company: createCompany,
          accessToken: token,
        },
        message: 'account created successful',
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async login(dto: companyLoginDto): Promise<globalApiResponseDto> {
    try {
      const { email, password, rc_number } = dto;
      const findCompany = await this.companyRepository.findOne({
        where: {
          email,
        },
      });
      if (!findCompany) {
        throw new NotFoundException(
          'the email address or password does not exist',
        );
      }
      if (findCompany) {
        const checkPassword = await compareHash(password, findCompany.password);
        if (!checkPassword) {
          throw new ForbiddenException('the password or email is incorrect');
        }
        // send notification maybe if needed
        const token = await this.authService.generateAuthToken({
          email: findCompany.email,
          userId: findCompany.id,
          role: findCompany.role,
        });
        return {
          statusCode: HttpStatus.OK,
          message: 'login successful',
          data: { company: findCompany, accessToken: token },
        };
      }
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getById(id: string, email?: string): Promise<globalApiResponseDto> {
    try {
      const findCompany = await this.companyRepository.findOne({
        where: {
          id,
        },
        cache: true,
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: findCompany,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getApplicantsByCategory(id: string): Promise<globalApiResponseDto> {
    try {
      const getTotal = await this.companyRepository.findOne({
        where: {
          id,
        },
        cache: true,
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: {
          totalApplicants: getTotal.totalApplicants,
          acceptedApplicant: getTotal.acceptedApplicants,
          shortlistedApplicants: getTotal.shortListedApplicants,
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getAllCompanies(
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { skip, take } = globalPaginationHelper(dto);
      const [companies, count] = await this.companyRepository.find({
        skip,
        take,
        relations: {
          jobs: true,
        },
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: {
          jobs: companies.jobs.map((v) => ({
            id: v.id,
            totalApplicants: v?.totalApplicants,
            createdDate: v.createdDate,
            jobName: v?.title,
            acceptedApplicantPerJob: v?.acceptedApplicant,
            shortListedApplicantPerJob: v.shortListedApplicant,
            updatedDate: v?.updatedDate,
            duration: v.duration,
          })),
          id: companies.id,
          name: companies.name,
          companyId: companies.companyId,
          email: companies.email,
          yearFounded: companies.year_founded,
          rc_number: companies.rc_number,
          address: companies.address,
          createdDate: companies.createdDate,
          updatedAt: companies.updatedDate,
          totalApplicants: companies.totalApplicants,
          acceptedApplicant: companies.acceptedApplicants,
          shortlistedApplicants: companies.shortListedApplicants,
        },
        totalCount: count,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getAcceptedApplicants(
    companyId: string,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { skip, take } = globalPaginationHelper(dto);
      const [data, count] = await this.companyRepository.find({
        skip,
        take,
        where: {
          id: companyId,
        },
        relations: {
          jobs: {
            acceptedApplicant: true,
          },
        },
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        totalCount: count,
        data: {
          companyId: data?.id,
          name: data?.name,
          job: data.jobs.map((j) => ({
            id: j.id,
            position: j.title,
            duration: j.duration,
            startDate: j.startDate,
            endDate: j.endDate,
            createdDate: j.createdDate,
          })),
          acceptedStudents: data.jobs.map((v) => ({
            student: v?.acceptedApplicant.flatMap((v) => ({
              studentId: v.students.id,
              createdDate: v?.students.createdDate,
              course: v?.students.courseOfStudy,
              CGPA: v?.students.CGPA,
              school: v?.students.school,
              department: v?.students.department,
              currentLevel: v?.students.level,
            })),
          })),
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getShortListedStudent(
    id: string,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { skip, take } = globalPaginationHelper(dto);
      const [data, count] = await this.companyRepository.find({
        skip,
        take,
        where: {
          id: id,
        },
        relations: {
          jobs: {
            shortListedApplicant: true,
          },
        },
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: {
          companyId: data.id,
          name: data.name,
          job: data.jobs.map((j) => ({
            id: j.id,
            position: j.title,
            duration: j.duration,
            startDate: j.startDate,
            endDate: j.endDate,
            createdDate: j.createdDate,
          })),
          student: data.jobs.map((v) => ({
            student: v?.acceptedApplicant.flatMap((v) => ({
              studentId: v.students.id,
              createdDate: v?.students.createdDate,
              course: v?.students.courseOfStudy,
              CGPA: v?.students.CGPA,
              school: v?.students.school,
              department: v?.students.department,
              currentLevel: v?.students.level,
            })),
          })),
        },
        totalCount: count,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async createdNewJob(
    id: string,
    dto: CreateJobDto,
  ): Promise<globalApiResponseDto> {
    try {
      const createJob = this.jobRepository.create({
        company: {
          id,
        },
        ...dto,
      });
      await this.jobRepository.save(createJob);
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: createJob,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }
}
