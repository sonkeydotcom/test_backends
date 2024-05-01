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
import { JobSearchDto, StudentDto } from './dto/student.dto';
import { isValid } from 'date-fns';
import { coreErrorHelper } from 'src/core/helpers/error.helper';
import { Jobs } from 'src/company/entity/jobs.entity';


@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Jobs)
    private jobsRepository: Repository<Jobs>,
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
      const { skip, take } = globalPaginationHelper(dto);
      if (dto.date) {
        if (!isValid(new Date(dto.date))) {
          throw new BadRequestException(
            'The date is invalid. Please input a valid date (YYYY-MM-DD)',
          );
        }
      }
      const [data, count] = await this.studentRepository.findAndCount({
        skip,
        take,
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

  async applyForJob(student: Student, jobId: string) {
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
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  /*

  - update student profile
  -- apply for jobs
  -- return where student is currently enrolled
  -- student onboarding

  */
}
