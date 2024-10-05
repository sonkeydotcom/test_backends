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
import { SavedApplications } from './entity/saved.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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
    @InjectRepository(SavedApplications)
    private savedApplicationsRepository: Repository<SavedApplications>,
    private readonly cloudinaryService: CloudinaryService,
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

      const [data, count] = await this.applyJobsRepository.findAndCount({
        where: {
          student: {
            id: student.id,
          },
        },
        relations: {
          job: {
            company: true,
          },
        },
      });

      const mappedData = data.map((application) => ({
        id: application.id,
        status: application.accepted,
        createdAt: application.createdAt,
        companyName: application.job?.company?.name || 'N/A',
        location: `${application.job?.address || 'N/A'}, ${application.job?.city || 'N/A'}, ${application.job?.state || 'N/A'}`,
        numberOfApplicants: application.job?.totalApplicants || 0,
        industry: application.job?.industry || 'N/A',
      }));

      return {
        statusCode: HttpStatus.OK,
        message: 'successful',
        data: {
          student: mappedData,
          count: count,
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async saveApplication(
    student: Student,
    jobId: string,
  ): Promise<globalApiResponseDto> {
    try {
      // Check if the job exists
      const job = await this.jobsRepository.findOne({
        where: {
          id: jobId,
        },
      });

      if (!job) {
        throw new NotFoundException(
          'The job is not available. If the error persists, contact support.',
        );
      }

      // Check if the student has already saved this job
      const existing = await this.savedApplicationsRepository.findOne({
        where: {
          job: {
            id: jobId,
          },
          student: {
            id: student.id,
          },
        },
      });

      if (existing) {
        return {
          message: 'You have already saved this job.',
          statusCode: HttpStatus.CONFLICT,
        };
      }

      const saveApplication = this.savedApplicationsRepository.create({
        job: {
          id: jobId,
        },
        student: {
          id: student.id,
        },
      });

      await this.savedApplicationsRepository.save(saveApplication);

      return {
        message: 'Job saved successfully',
        statusCode: HttpStatus.CREATED,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getAllSavedJobs(
    student: Student,
    dto: GlobalPaginationDto,
    saved: boolean,
  ): Promise<globalApiResponseDto> {
    try {
      // const { skip, take } = globalPaginationHelper(dto);
      const savedApplications = await this.savedApplicationsRepository.find({
        where: {
          student: {
            id: student.id,
          },
        },
        relations: {
          job: {
            company: true,
          },
        },
        // skip,
        // take,
      });

      const mappedData = savedApplications.map((application) => ({
        id: application.id,
        // status: application?.accepted,
        createdAt: application.createdAt,
        companyName: application.job?.company?.name || 'N/A',
        location: `${application.job?.address || 'N/A'}, ${application.job?.city || 'N/A'}, ${application.job?.state || 'N/A'}`,
        numberOfApplicants: application.job?.totalApplicants || 0,
        industry: application.job?.industry || 'N/A',
      }));

      return {
        message: 'all saved jobs fetched successfully',
        data: mappedData,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return coreErrorHelper(error);
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
      const jobs = await this.jobsRepository.find({
        relations: {
          company: true,
        },
      });
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

      const existing = await this.applyJobsRepository.findOne({
        where: {
          job: {
            id: jobId,
          },
          student: {
            id: student.id,
          },
        },
      });

      if (existing) {
        return {
          message: 'You have already applied to this job.',
          statusCode: HttpStatus.CONFLICT,
        };
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
    files: Express.Multer.File[],
  ): Promise<globalApiResponseDto> {
    try {
      const { bio, email, firstName, lastName, phoneNumber, password } = dto;

      let profileImageUrl: string | undefined;
      let backgroundImageUrl: string | undefined;
      let documentUrls: string | undefined;

      for (const file of files) {
        if (!file) continue;

        const ext = extname(file.originalname).toLowerCase();

        switch (file.fieldname) {
          case 'profileImage':
            const profileUpload = await this.cloudinaryService.uploadFile(
              file,
              'profile_images',
            );
            profileImageUrl = profileUpload.secure_url;
            break;

          case 'backgroundImage':
            const backgroundUpload = await this.cloudinaryService.uploadFile(
              file,
              'background_images',
            );
            backgroundImageUrl = backgroundUpload.secure_url;
            break;

          case 'documents':
            const documentUpload = await this.cloudinaryService.uploadFile(
              file,
              'documents',
            );
            documentUrls = documentUpload.secure_url;
            break;
        }
      }

      await this.studentRepository.update(student.id, {
        lastName: lastName ?? undefined,
        bio: bio ?? undefined,
        firstName: firstName ?? undefined,
        phoneNumber: phoneNumber ?? undefined,
        email: email ?? undefined,
        profileImageUrl: profileImageUrl ?? undefined,
        backgroundImageUrl: backgroundImageUrl ?? undefined,
        documentUrls: documentUrls ?? undefined,
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
