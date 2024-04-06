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

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private jobRepository: Repository<Jobs>,
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
      await this.companyRepository.save(createCompany);
      return {
        statusCode: HttpStatus.CREATED,
        data: createCompany,
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
        throw new NotFoundException('the email address used does not exist');
      }
      if (findCompany) {
        const checkPassword = await compareHash(
          dto.password,
          findCompany.password,
        );
        if (!checkPassword) {
          throw new ForbiddenException('the password or email is incorrect');
        }
        // send notification maybe if needed
        return {
          statusCode: HttpStatus.OK,
          message: 'login successful',
          data: findCompany,
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
          email: email ? email : undefined,
        },
        cache: true,
        relations: {
          jobs: true,
        },
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: {
          jobs: findCompany.jobs.map((v) => ({
            id: v.id,
            totalApplicants: v?.totalApplicants,
            createdDate: v.createdDate,
            position: v?.title,
            acceptedApplicantPerJob: v?.acceptedApplicant,
            shortListedApplicantPerJob: v.shortListedApplicant,
            updatedDate: v?.updatedDate,
            duration: v.duration,
          })),
          id: findCompany.id,
          name: findCompany.name,
          companyId: findCompany.companyId,
          email: findCompany.email,
          yearFounded: findCompany.year_founded,
          rc_number: findCompany.rc_number,
          address: findCompany.address,
          createdDate: findCompany.createdDate,
          updatedAt: findCompany.updatedDate,
          totalApplicants: findCompany.totalApplicants,
          acceptedApplicant: findCompany.acceptedApplicant,
          shortlistedApplicants: findCompany.shortListedApplicant,
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getApplicantsByCategory(
    company: Company,
  ): Promise<globalApiResponseDto> {
    try {
      const getTotal = await this.companyRepository.findOne({
        where: {
          id: company.id,
        },
        cache: true,
        relations: {
          jobs: true,
        },
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: {
          totalApplicants: getTotal.totalApplicants,
          acceptedApplicant: getTotal.acceptedApplicant,
          shortlistedApplicants: getTotal.shortListedApplicant,
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
          acceptedApplicant: companies.acceptedApplicant,
          shortlistedApplicants: companies.shortListedApplicant,
        },
        totalCount: count,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getAcceptedApplicants(jobId: string): Promise<globalApiResponseDto> {
    // subject to pagination
    try {
      const findCompanyJob = await this.jobRepository.findOne({
        where: {
          id: jobId,
        },
      });
      if (findCompanyJob.acceptedApplicant === 0) {
        return {
          message: 'you have no accepted applicant yet',
          statusCode: HttpStatus.OK,
        };
      }
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: {
          jobId: findCompanyJob.id,
          position: findCompanyJob.title,
          duration: findCompanyJob.duration,
          startDate: findCompanyJob.startDate,
          endDate: findCompanyJob.endDate,
          createdDate: findCompanyJob.createdDate,
          student: findCompanyJob.acceptedStudent.map((v) => ({
            studentId: v?.id,
            createdDate: v?.createdDate,
            course: v?.courseOfStudy,
            CGPA: v?.CGPA,
            school: v?.school,
            department: v?.department,
            currentLevel: v?.level,
          })),
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getShortListedStudent(id: string): Promise<globalApiResponseDto> {
    // subject to pagination
    try {
      const getCompany = await this.jobRepository.findOne({
        where: {
          id,
        },
      });

      if (getCompany.shortListedApplicant === 0) {
        return {
          message: 'you have no accepted applicant yet',
          statusCode: HttpStatus.OK,
        };
      }
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        // data: getCompany.
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async createdNewJob(
    company: Company,
    dto: CreateJobDto,
  ): Promise<globalApiResponseDto> {
    try {
      const createJob = this.jobRepository.create({
        company: {
          id: company.id,
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
