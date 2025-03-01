import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getDataSourcePrefix, InjectRepository } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { Not, IsNull, Repository, Between, Like } from 'typeorm';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { globalPaginationHelper } from 'src/core/helpers/paginationHelper';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';
import {
  jobApplyDto,
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
import { AcceptedApplicants } from 'src/company/entity/accepted-applicant.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(AcceptedApplicants)
    private acceptedRepository: Repository<AcceptedApplicants>,
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
        capacity: application.job?.company?.student_capacity || 0,
        website: application.job?.company?.website || 'N/A',
        founded: application.job?.company?.year_founded || 'N/A',
        profileImage: application.job?.company?.profileImageUrl || 'N/A',
        backgroundImage: application.job?.company?.backgroundImageUrl || 'N/A',
        email: application.job?.company?.email || 'N/A',
        rcNumber: application.job?.company?.rc_number || 'N/A',
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
    dto: jobApplyDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { jobId } = dto;
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
        job,
        student: student,
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
    dto: jobApplyDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { jobId } = dto;
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
        job: getJob, // Pass the full job entity
        student: student, // Pass the full student entity
      });
      // applyJ.accepted = true;
      // const company = await this.jobsRepository.findOne({
      //   where: {
      //     id: jobId,
      //   },
      //   relations: {
      //     company: true,
      //   },
      // });

      getJob.totalApplicants = (getJob.totalApplicants || 0) + 1;
      // Save the application and update the company
      await this.applyJobsRepository.save(applyJ);
      await this.jobsRepository.save(getJob);

      return {
        message: 'job applied successful',
        statusCode: HttpStatus.CREATED,
        data: applyJ,
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
      const {
        bio,
        firstName,
        lastName,
        phoneNumber,
        softSkills,
        technicalSkills,
        goals,
        preferredIndustry,
      } = dto;

      let profileImageUrl: string | undefined;
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
        softSkills: softSkills ?? undefined,
        profileImageUrl: profileImageUrl ?? undefined,
        technicalSkills: technicalSkills ?? undefined,
        goals: goals ?? undefined,
        preferredIndustry: preferredIndustry ?? undefined,
        documentUrls: documentUrls ?? undefined,
        // password: password ? await encryptString(password) : undefined,
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
        throw new NotFoundException(`Student data not found`);
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

  async getStudentCurrentIt2(student: Student): Promise<globalApiResponseDto> {
    try {
      const acceptedApplicant = await this.acceptedRepository.find({
        where: {
          student: { id: student.id },
        },
        relations: ['jobs', 'jobs.company'], // Include related job information
      });

      const mappedData = acceptedApplicant.map((hello) => ({
        id: hello.id,
        name: hello.jobs.company.name,
        industry: hello.jobs.industry,
        startDate: hello.startDate,
        endDate: hello.endDate,
        founded: hello.jobs.company.year_founded,
        duration: hello.jobs.duration,
        location: `${hello.jobs.address}, ${hello.jobs.city}, ${hello.jobs.state}`,
        capacity: hello.jobs.company.student_capacity,
        website: hello.jobs.company.website,
        description: hello.jobs.company.description,
        totalApplicants: hello.jobs.totalApplicants,
        backgroundImage: hello.jobs.company.backgroundImageUrl,
        profileImage: hello.jobs.company.profileImageUrl,
      }));

      return {
        statusCode: HttpStatus.OK,
        message: acceptedApplicant
          ? 'Accepted applicant found'
          : 'No accepted applicant found',
        data: mappedData,
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
