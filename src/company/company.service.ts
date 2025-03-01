import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { Repository } from 'typeorm';
import {
  acceptDto,
  companyDto,
  companyLoginDto,
  UpdateCompanyProfileDto,
} from './dto/company.dto';
import { coreErrorHelper } from 'src/core/helpers/error.helper';
import { compareHash, encryptString } from 'src/core/helpers/encrypt.helper';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';
import { Jobs } from './entity/jobs.entity';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { globalPaginationHelper } from 'src/core/helpers/paginationHelper';
import { CreateJobDto } from './dto/jobs.dto';
import { AcceptedApplicants } from './entity/accepted-applicant.entity';
import { AppliedStudents } from './entity/applied-applicants.entity';
import { ShortlistedApplicant } from './entity/shortlisted-applicant.entity';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { extname } from 'path';

@Injectable()
export class CompanyService {
  async getCompanyProfile(company: Company) {
    try {
      const findCompany = await this.companyRepository.findOne({
        where: {
          id: company.id,
        },
        cache: true,
      });
      if (!findCompany) {
        throw new NotFoundException('the company data does not exist');
      }
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: findCompany,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Jobs)
    private jobRepository: Repository<Jobs>,
    @InjectRepository(AcceptedApplicants)
    private acceptedApplicantsRepository: Repository<AcceptedApplicants>,
    @InjectRepository(ShortlistedApplicant)
    private shortedListedApplicantsRepository: Repository<ShortlistedApplicant>,
    @InjectRepository(AppliedStudents)
    private applyJobsRepository: Repository<AppliedStudents>,
    private authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createCompanyAccount(dto: companyDto) {
    try {
      const checkIf = await this.companyRepository.findOne({
        where: {
          email: dto.email.toLowerCase(),
        },
      });

      if (checkIf) {
        throw new ForbiddenException('The company account already exists');
      }

      const createCompany = this.companyRepository.create({
        address: dto.address,
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
      const { email, password } = dto;
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

      if (!findCompany.isVerified) {
        throw new ForbiddenException('Company is not verified');
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

  async getById(id: string): Promise<globalApiResponseDto> {
    try {
      const findCompany = await this.companyRepository.findOne({
        where: {
          id,
        },
        cache: true,
      });
      if (!findCompany) {
        throw new NotFoundException('the company data does not exist');
      }
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: findCompany,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getBy(company: Company): Promise<globalApiResponseDto> {
    try {
      const findJobs = await this.jobRepository.find({
        where: {
          company: {
            id: company.id,
          },
        },
        cache: true,
      });
      if (!findJobs) {
        throw new NotFoundException('the company data does not exist');
      }
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: findJobs,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getApplicantsByCategory(
    company: Company,
  ): Promise<globalApiResponseDto> {
    try {
      const totalApplicants = await this.applyJobsRepository.findAndCount({
        where: {
          job: {
            company: {
              id: company.id,
            },
          },
        },
        select: ['id', 'accepted'],
        relations: {
          student: true,
          job: true,
        },
      });

      const acceptedApplicants =
        await this.acceptedApplicantsRepository.findAndCount({
          where: {
            jobs: {
              company: {
                id: company.id,
              },
            },
          },
          relations: {
            student: true,
          },
        });

      const shortListedApplicants =
        await this.shortedListedApplicantsRepository.findAndCount({
          where: {
            jobs: {
              company: {
                id: company.id,
              },
            },
          },
          relations: {
            student: true,
          },
        });

      const acceptedMap = new Map(
        acceptedApplicants[0].map((applicant) => [
          applicant.student.id,
          applicant,
        ]),
      );

      // Merge startDate and endDate into totalApplicants
      const formattedApplicants = totalApplicants[0].map((applicant) => {
        const acceptedData = acceptedMap.get(applicant.student.id); // Find in acceptedMap

        return {
          id: applicant.id,
          accepted: applicant.accepted,
          startDate: acceptedData?.startDate || null, // Use accepted data if available
          endDate: acceptedData?.endDate || null,
          student: applicant.student,
        };
      });

      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: {
          totalApplicants: [formattedApplicants, totalApplicants[1]],
          acceptedApplicants,
          shortListedApplicants,
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
          // companyId: companies.companyId,
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
    company: Company,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { skip, take } = globalPaginationHelper(dto);
      const [data, count] = await this.companyRepository.find({
        skip,
        take,
        where: {
          id: company.id,
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
            // startDate: j.startDate,
            // endDate: j.endDate,
            createdDate: j.createdDate,
          })),
          acceptedStudents: data.jobs.map((v) => ({
            student: v?.acceptedApplicant.flatMap((v) => ({
              studentId: v.student.id,
              createdDate: v?.student.createdDate,
              course: v?.student.courseOfStudy,
              CGPA: v?.student.CGPA,
              school: v?.student.school,
              department: v?.student.department,
              currentLevel: v?.student.level,
            })),
          })),
        },
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getShortListedStudent(
    company: Company,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { skip, take } = globalPaginationHelper(dto);
      const [data, count] = await this.companyRepository.find({
        skip,
        take,
        where: {
          id: company.id,
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
            // startDate: j.startDate,
            // endDate: j.endDate,
            createdDate: j.createdDate,
          })),
          student: data.jobs.map((v) => ({
            student: v?.acceptedApplicant.flatMap((v) => ({
              studentId: v.student.id,
              createdDate: v?.student.createdDate,
              course: v?.student.courseOfStudy,
              CGPA: v?.student.CGPA,
              school: v?.student.school,
              department: v?.student.department,
              currentLevel: v?.student.level,
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

  async updateJob(
    company: Company,
    jobId: string, // Receive the job ID from the controller
    dto: CreateJobDto,
  ): Promise<globalApiResponseDto> {
    try {
      // Find the job by its ID and the company's ID
      const existingJob = await this.jobRepository.findOne({
        where: {
          id: jobId,
          company: { id: company.id },
        },
      });

      if (!existingJob) {
        throw new NotFoundException('Job not found');
      }

      // Update existing job with DTO data
      Object.assign(existingJob, dto);

      const updated = await this.jobRepository.save(existingJob);

      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: updated,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  // Accept student

  async acceptStudent(
    company: Company,
    dto: acceptDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { studentId } = dto;
      // Find the applied student by ID
      const appliedStudent = await this.applyJobsRepository.findOne({
        where: {
          student: {
            id: studentId,
          },
          job: {
            company: {
              id: company.id,
            },
          },
        },
        relations: ['student', 'job'],
      });

      if (!appliedStudent) {
        throw new NotFoundException(
          'Applied student not found for this company.',
        );
      }

      // Check if the student is already accepted
      const existingAccepted = await this.acceptedApplicantsRepository.findOne({
        where: {
          student: {
            id: studentId,
          },
          jobs: {
            id: appliedStudent.job.id,
          },
        },
      });

      if (existingAccepted) {
        throw new ForbiddenException(
          'Student has already been accepted for this job.',
        );
      }

      const acceptanceDate = new Date();
      const internshipDuration = appliedStudent.job.duration;
      const internshipStart = new Date(acceptanceDate);
      const internshipEnd = new Date(acceptanceDate);
      internshipEnd.setMonth(internshipEnd.getMonth() + internshipDuration);

      // Create a new accepted applicant entry
      const acceptedApplicant = this.acceptedApplicantsRepository.create({
        student: {
          id: studentId,
        },
        jobs: {
          id: appliedStudent.job.id,
        },
        startDate: internshipStart,
        endDate: internshipEnd,
      });

      appliedStudent.accepted = true;
      await this.applyJobsRepository.save(appliedStudent);

      // Save the accepted applicant
      await this.acceptedApplicantsRepository.save(acceptedApplicant);

      // Optionally, remove the student from applied applicants or update status
      // await this.applyJobsRepository.delete(appliedStudent.id);

      return {
        message: 'Student accepted successfully.',
        statusCode: HttpStatus.OK,
        data: {
          acceptedApplicant,
          internshipStart: acceptanceDate,
          internshipEnd,
        },
      };
    } catch (error) {
      return coreErrorHelper(error);
    }
  }

  // Shortlist student

  async shortlistStudent(
    company: Company,
    dto: acceptDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { studentId } = dto;
      // Find the applied student by ID
      const appliedStudent = await this.applyJobsRepository.findOne({
        where: {
          id: studentId,
          job: {
            company: {
              id: company.id,
            },
          },
        },
        relations: ['student', 'job'],
      });

      if (!appliedStudent) {
        throw new NotFoundException(
          'Applied student not found for this company.',
        );
      }

      // Check if the student is already shortlisted
      const existingShortlisted =
        await this.shortedListedApplicantsRepository.findOne({
          where: {
            student: {
              id: studentId,
            },
            jobs: {
              id: appliedStudent.job.id,
            },
          },
        });

      if (existingShortlisted) {
        throw new ForbiddenException(
          'Student has already been shortlisted for this job.',
        );
      }

      // Create a new shortlisted applicant entry
      const shortlistedApplicant =
        this.shortedListedApplicantsRepository.create({
          student: {
            id: studentId,
          },
          jobs: {
            id: appliedStudent.job.id,
          },
        });

      // Save the shortlisted applicant
      await this.shortedListedApplicantsRepository.save(shortlistedApplicant);

      // Optionally, remove the student from applied applicants or update status
      // await this.applyJobsRepository.delete(appliedStudent.id);

      return {
        message: 'Student shortlisted successfully.',
        statusCode: HttpStatus.OK,
        data: shortlistedApplicant,
      };
    } catch (error) {
      return coreErrorHelper(error);
    }
  }

  // Save student

  // async saveStudent(
  //   company: Company,
  //   studentId: string,
  // ): Promise<globalApiResponseDto> {
  //   try {
  //     // Check if the student exists
  //     const student = await this.applyJobsRepository.findOne({
  //       where: {
  //         id: studentId,
  //         job: {
  //           company: {
  //             id: company.id,
  //           },
  //         },
  //       },
  //       relations: ['student', 'job'],
  //     });

  //     if (!student) {
  //       throw new NotFoundException(
  //         'Applied student not found for this company.',
  //       );
  //     }

  //     // Check if already saved
  //     const alreadySaved = await this.savedApplicantRepository.findOne({
  //       where: {
  //         company: {
  //           id: company.id,
  //         },
  //         student: {
  //           id: studentId,
  //         },
  //       },
  //     });

  //     if (alreadySaved) {
  //       throw new ForbiddenException('Student is already saved.');
  //     }

  //     // Create a new saved applicant entry
  //     const savedApplicant = this.savedApplicantRepository.create({
  //       company: {
  //         id: company.id,
  //       },
  //       student: {
  //         id: studentId,
  //       },
  //     });

  //     // Save the entry
  //     await this.savedApplicantRepository.save(savedApplicant);

  //     return {
  //       message: 'Student saved successfully.',
  //       statusCode: HttpStatus.OK,
  //       data: savedApplicant,
  //     };
  //   } catch (error) {
  //     return coreErrorHelper(error);
  //   }
  // }

  // Decline student ?

  async declineStudent(
    company: Company,
    dto: acceptDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { studentId } = dto;
      // Find the applied student by ID
      const appliedStudent = await this.applyJobsRepository.findOne({
        where: {
          id: studentId,
          job: {
            company: {
              id: company.id,
            },
          },
        },
        relations: ['student', 'job'],
      });

      if (!appliedStudent) {
        throw new NotFoundException(
          'Applied student not found for this company.',
        );
      }

      // Optionally, check if the student has already been accepted or shortlisted
      const isAccepted = await this.acceptedApplicantsRepository.findOne({
        where: {
          student: {
            id: studentId,
          },
          jobs: {
            id: appliedStudent.job.id,
          },
        },
      });

      const isShortlisted =
        await this.shortedListedApplicantsRepository.findOne({
          where: {
            student: {
              id: studentId,
            },
            jobs: {
              id: appliedStudent.job.id,
            },
          },
        });

      if (isAccepted || isShortlisted) {
        throw new ForbiddenException(
          'Cannot decline a student who has been accepted or shortlisted.',
        );
      }

      // Delete the applied student entry
      await this.applyJobsRepository.delete(appliedStudent.id);

      return {
        message: 'Student declined successfully.',
        statusCode: HttpStatus.OK,
        data: null,
      };
    } catch (error) {
      return coreErrorHelper(error);
    }
  }

  async updateCompanyProfile(
    dto: UpdateCompanyProfileDto,
    company: Company,
    files: Express.Multer.File[],
  ): Promise<globalApiResponseDto> {
    try {
      const { phone, website, address, student_capacity } = dto;

      let profileImageUrl: string | undefined;
      let backgroundImageUrl: string | undefined;

      for (const file of files) {
        if (!file) continue;
        if (!file.fieldname) {
          console.warn('File without fieldname encountered:', file);
          continue;
        }

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
        }
      }

      await this.companyRepository.update(company.id, {
        phone: phone ?? undefined,
        website: website ?? undefined,
        address: address ?? undefined,
        profileImageUrl: profileImageUrl ?? undefined,
        backgroundImageUrl: backgroundImageUrl ?? undefined,
        student_capacity: student_capacity,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'successful',
        data: company,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }
}
