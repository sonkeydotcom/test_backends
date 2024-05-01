import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Student')
@Controller('student')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('/admin/count')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  getStudentCount(
    @Query() dto: GlobalPaginationDto,
    @Query() studentDto: StudentDto,
  ) {
    return this.studentsService.getCountStudent(studentDto, dto);
  }

  @Post('/job/apply')
  @UseGuards(AuthGuard())
  applyJob(@GetUser() student: Student, @Body() id: string) {
    return this.studentsService.applyForJob(student, id);
  }

  @Get('/admin/data')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  getStudentData(
    @Query() dto: GlobalPaginationDto,
    @Query() studentDto: StudentDto,
  ) {
    return this.studentsService.getStudentData(studentDto, dto);
  }

  @Get('/applications')
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
  @UseGuards(AuthGuard())
  searchForItJobs(@Query() dto: JobSearchDto) {
    return this.studentsService.searchForJobs(dto);
  }

  @Post('/profile')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/student',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  updateStudentProfile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }), // max set to 5mb
          new FileTypeValidator({ fileType: /\/(jpg|jpeg|png|pdf)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Query()
    dto: UpdateStudentProfileDto,
    @GetUser() student: Student,
  ) {
    return this.studentsService.updateStudentProfile(dto, student, file);
  }

  @Get('/onboard')
  onboardStudent(@Query() dto: StudentOnboarding) {
    return this.studentsService.onboardStudent(dto);
  }

  @Get('/job/current')
  getCurrentJob(@GetUser() student: Student) {
    return this.studentsService.getStudentCurrentIt(student);
  }
}
