import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { Not, IsNull, Repository, Between, Like } from 'typeorm';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { globalPaginationHelper } from 'src/core/helpers/paginationHelper';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';
import {
  JobSearchDto,
  StudentDto,
  StudentOnboarding,
  UpdateStudentProfileDto,
} from './dto/student.dto';
import { isValid } from 'date-fns';
import { coreErrorHelper } from 'src/core/helpers/error.helper';
import { Jobs } from 'src/company/entity/jobs.entity';
import { AppliedStudents } from 'src/company/entity/applied-applicants.entity';
import { encryptString } from 'src/core/helpers/encrypt.helper';
import { extname } from 'path';
import { data } from 'src/dummy';
import { Company } from '../company/entity/company.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Jobs)
    private jobsRepository: Repository<Jobs>,
    @InjectRepository(AppliedStudents)
    private applyJobsRepository: Repository<AppliedStudents>,
  ) {}

  async getCountStudent(
    studentDto: StudentDto,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { accepted, searching, applied, shortlisted } = studentDto;
      const { skip, take } = globalPaginationHelper(dto);
      const whereClause: any = {};
      if (dto.date) {
        if (!isValid(new Date(dto.date))) {
          throw new BadRequestException(
            'The date is invalid. Please input a valid date (YYYY-MM-DD)',
          );
        }
        whereClause.createdDate = new Date(dto.date);
      }
      whereClause.searching = searching;

      const getCounting = await this.studentRepository.count({
        where: whereClause,
        relations: {
          ...(accepted && accepted === true
            ? {
                acceptedApplicants: true,
              }
            : applied && applied === true
              ? {
                  applied: true,
                }
              : shortlisted && shortlisted === true
                ? {
                    shortlistedApplicants: true,
                  }
                : undefined),
        },
        skip,
        take,
      });
      return {
        message: 'successful',
        data: getCounting,
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getStudentData(
    studentDto: StudentDto,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { accepted, searching, applied, shortlisted } = studentDto;
      const { skip, take } = globalPaginationHelper(dto);
      const whereClause: any = {};
      if (dto.date) {
        if (!isValid(new Date(dto.date))) {
          throw new BadRequestException(
            'The date is invalid. Please input a valid date (YYYY-MM-DD)',
          );
        }
        whereClause.createdDate = new Date(dto.date);
      }
      whereClause.searching = searching;

      const [data, count] = await this.studentRepository.find({
        where: whereClause,
        relations: {
          ...(accepted && accepted === true
            ? {
                acceptedApplicants: true,
              }
            : applied && applied === true
              ? {
                  applied: true,
                }
              : shortlisted && shortlisted === true
                ? {
                    shortlistedApplicants: true,
                  }
                : undefined),
        },
        skip,
        take,
      });
      return {
        message: 'successful',
        data: data,
        statusCode: HttpStatus.OK,
        totalCount: count,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getAllApplicationsByStudent(
    student: Student,
    dto: GlobalPaginationDto,
    saved: boolean,
  ): Promise<globalApiResponseDto> {
    try {
      // const { skip, take } = globalPaginationHelper(dto);
      if (dto.date) {
        if (!isValid(new Date(dto.date))) {
          throw new BadRequestException(
            'The date is invalid. Please input a valid date (YYYY-MM-DD)',
          );
        }
      }
      const [data, count] = await this.studentRepository.findAndCount({
        // skip,
        // take,
        where: {
          id: student.id,
        },
        relations: {
          ...(saved !== true ? { applied: true } : { savedApplication: true }),
        },
      });
      const getAllCount =
        saved !== true
          ? this.studentRepository.count({
              where: {
                applied: Not(IsNull()),
              },
            })
          : this.studentRepository.count({
              where: {
                savedApplication: Not(IsNull()),
              },
            });

      return {
        statusCode: HttpStatus.OK,
        message: 'successful',
        data: {
          student: data,
          count: count,
        },
        totalCount: getAllCount,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async searchForJobs(dto: JobSearchDto): Promise<globalApiResponseDto> {
    try {
      const { duration, field, location, orderBy } = dto;
      const [data, count] = await this.jobsRepository.findAndCount({
        where: {
          industry: Like(`%${field}%`),
          duration: Between(duration.start, duration.end),
          city: Like(`%${location}%`),
        },
        order: {
          createdDate: orderBy,
        },
      });
      return {
        message: 'successful',
        data: data,
        totalCount: count,
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getAllJobs() {
    try {
      const jobs = await this.jobsRepository.find();
      return {
        message: 'all jobs fetched successfully',
        data: jobs,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return coreErrorHelper(error);
    }
  }

  async getAllCompanies() {
    try {
      const companies = await this.companyRepository.findAndCount();
      return {
        message: 'all jobs fetched successfully',
        data: companies,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return coreErrorHelper(error);
    }
  }

  async applyForJob(
    student: Student,
    jobId: string,
  ): Promise<globalApiResponseDto> {
    try {
      const getJob = await this.jobsRepository.findOne({
        where: {
          id: jobId,
        },
      });
      if (!getJob) {
        throw new NotFoundException(
          'the job is not available, if error persist contact support',
        );
      }
      const applyJ = this.applyJobsRepository.create({
        job: {
          id: jobId,
        },
        student: {
          id: student.id,
        },
      });
      await this.applyJobsRepository.save(applyJ);
      return {
        message: 'job applied successful',
        statusCode: HttpStatus.CREATED,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async updateStudentProfile(
    dto: UpdateStudentProfileDto,
    student: Student,
    file: Express.Multer.File,
  ): Promise<globalApiResponseDto> {
    try {
      const { bio, email, firstName, lastName, phoneNumber, password } = dto;

      const name = file.originalname.split('.')[0];
      const ext = extname(file.originalname);
      const fileName = `${student.matriculationNumber}_${name}_${ext}`;
      await this.studentRepository.update(student.id, {
        lastName: lastName ?? undefined,
        bio: bio ?? undefined,
        firstName: firstName ?? undefined,
        phoneNumber: phoneNumber ?? undefined,
        email: email ?? undefined,
        imagePath: fileName ?? undefined,
        password: password ? await encryptString(password) : undefined,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'successful',
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async onboardStudent(dto: StudentOnboarding): Promise<globalApiResponseDto> {
    try {
      const findStudent = await this.studentRepository.findOne({
        where: {
          matriculationNumber: dto.matNo.toLowerCase(),
          school: dto.school.toLowerCase(),
        },
      });
      if (!findStudent) {
        throw new NotFoundException('sorry, you do not exist in the database');
      }
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: findStudent,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async checkMatriculation(
    matriculation: string,
  ): Promise<{ message: string; data?: any }> {
    try {
      // Find the student with the matching matriculation number
      const student = data.find(
        (student) =>
          student.matriculation.toUpperCase() === matriculation.toUpperCase(),
      );

      if (!student) {
        // If no student is found, return a "not found" message
        throw new NotFoundException(
          `Student with the provided ${matriculation} number was not found`,
        );
      }

      // If a student is found, return their details along with the message
      return {
        message: 'found',
        data: student,
      };
    } catch (error) {
      return coreErrorHelper(error);
    }
  }

  async getStudentCurrentIt(student: Student): Promise<globalApiResponseDto> {
    try {
      const get = await this.studentRepository.findOne({
        where: {
          id: student.id,
          applied: {
            accepted: true,
          },
        },
        relations: {
          applied: true,
        },
        cache: true,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'successful',
        data: get,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }
}
