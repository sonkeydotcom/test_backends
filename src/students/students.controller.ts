import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/auth/entities/users.entity';
import { RoleGuard, Roles } from 'src/auth/guard/roles.guard';
import {
  JobSearchDto,
  StudentDto,
  StudentOnboarding,
  UpdateStudentProfileDto,
} from './dto/student.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Student } from './entity/student.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Student')
@Controller('student')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('/admin/count')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  getStudentCount(
    @Query() dto: GlobalPaginationDto,
    @Query() studentDto: StudentDto,
  ) {
    return this.studentsService.getCountStudent(studentDto, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/job/apply')
  applyJob(@GetUser() student: Student, @Body() body: { id: string }) {
    const { id } = body; // Extract the `id` field from the body object
    return this.studentsService.applyForJob(student, id);
  }

  @Get('/admin/data')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  getStudentData(
    @Query() dto: GlobalPaginationDto,
    @Query() studentDto: StudentDto,
  ) {
    return this.studentsService.getStudentData(studentDto, dto);
  }

  @Get('/applications')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  getStudentApplication(
    @Query() dto: GlobalPaginationDto,
    @GetUser() student: Student,
    @Query() saved: boolean,
  ) {
    return this.studentsService.getAllApplicationsByStudent(
      student,
      dto,
      saved,
    );
  }

  @Get('/search/jobs')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  searchForItJobs(@Query() dto: JobSearchDto) {
    return this.studentsService.searchForJobs(dto);
  }

  @Get('/jobs')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  getAllJobs() {
    return this.studentsService.getAllJobs();
  }

  @Post('/saved/applications')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  saveApplication(@GetUser() student: Student, @Body() body: { id: string }) {
    const { id } = body; // Extract the `id` field from the body object
    return this.studentsService.saveApplication(student, id);
  }

  @Get('/saved/applications')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  getSavedApplications(
    @Query() dto: GlobalPaginationDto,
    @GetUser() student: Student,
    @Query() saved: boolean,
  ) {
    return this.studentsService.getAllSavedJobs(student, dto, saved);
  }

  @Get('/companies')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  getAllCompanies() {
    return this.studentsService.getAllCompanies();
  }

  @Post('/profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'backgroundImage', maxCount: 1 },
        { name: 'documents', maxCount: 1 },
      ],
      {
        fileFilter: (req, file, cb) => {
          if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
            cb(null, true);
          } else {
            cb(new Error('Unsupported file type'), false);
          }
        },
        limits: {
          fileSize: 110 * 1024 * 1024, // 110 MB
        },
      },
    ),
  )
  updateStudentProfile(
    @Body()
    dto: UpdateStudentProfileDto,
    @GetUser() student: Student,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      backgroundImage?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    const allFiles: Express.Multer.File[] = [
      ...(files.profileImage || []),
      ...(files.backgroundImage || []),
      ...(files.documents || []),
    ];

    return this.studentsService.updateStudentProfile(dto, student, allFiles);
  }

  @Get('/onboard')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  onboardStudent(@Query() dto: StudentOnboarding) {
    return this.studentsService.onboardStudent(dto);
  }

  @Get('/job/current')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  getCurrentJob(@GetUser() student: Student) {
    return this.studentsService.getStudentCurrentIt(student);
  }

  @Post('/check')
  checkMatriculation(@Body('matriculation') matriculation: string) {
    // Calls the service method and passes the matriculation data
    return this.studentsService.checkMatriculation(matriculation);
  }

  @Get('/check')
  checkMatric() {
    return 'Hello wold';
  }
}
