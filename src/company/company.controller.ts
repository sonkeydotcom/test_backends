import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  acceptDto,
  companyDto,
  companyLoginDto,
  UpdateCompanyProfileDto,
} from './dto/company.dto';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { CreateJobDto } from './dto/jobs.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/auth/entities/users.entity';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Company } from './entity/company.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('/create')
  // allow this endpoint to receive media files
  companyCreateAccount(@Body() create: companyDto) {
    return this.companyService.createCompanyAccount(create);
  }

  @Post('/login')
  companyLogin(@Body() dto: companyLoginDto) {
    return this.companyService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/:id')
  CompanyById(@Param('id') id: string) {
    return this.companyService.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/jobs/all')
  CompanyBy(@GetUser() company: Company) {
    return this.companyService.getBy(company);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/profile')
  getCompanyProfile(@GetUser() company: Company) {
    return this.companyService.getCompanyProfile(company);
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
  updateCompanyProfile(
    @Body()
    dto: UpdateCompanyProfileDto,
    @GetUser() company: Company,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      backgroundImage?: Express.Multer.File[];
    },
  ) {
    const allFiles: Express.Multer.File[] = [];

    if (files && files.profileImage) {
      allFiles.push(...files.profileImage);
    }

    if (files && files.backgroundImage) {
      allFiles.push(...files.backgroundImage);
    }

    return this.companyService.updateCompanyProfile(dto, company, allFiles);
  }

  @Get('/admin/all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  getAllCompanies(@Query() dto: GlobalPaginationDto) {
    return this.companyService.getAllCompanies(dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('/applicants/accepted')
  getAllAcceptedApplicants(
    @GetUser() company: Company,
    @Query() dto: GlobalPaginationDto,
  ) {
    return this.companyService.getAcceptedApplicants(company, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('/applicants/shortlisted')
  getShortListedApplicants(
    @GetUser() company: Company,
    @Query() dto: GlobalPaginationDto,
  ) {
    return this.companyService.getShortListedStudent(company, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Post('/job/new')
  createNewJob(@Body() dto: CreateJobDto, @GetUser() company: Company) {
    return this.companyService.createdNewJob(company, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Put('/job/update/:jobId')
  updateJob(
    @GetUser() company: Company,
    @Param('jobId') jobId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.companyService.updateJob(company, jobId, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('/all/category')
  applicantsByCategory(@GetUser() company: Company) {
    return this.companyService.getApplicantsByCategory(company);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Post('/applicants/accept/')
  acceptStudent(@GetUser() company: Company, @Body() dto: acceptDto) {
    return this.companyService.acceptStudent(company, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Post('/applicants/shortlist/')
  shortlistStudent(@GetUser() company: Company, @Body() dto: acceptDto) {
    return this.companyService.shortlistStudent(company, dto);
  }

  // @UseGuards(AuthGuard())
  // @ApiBearerAuth()
  // @Post('/applicants/save/:studentId')
  // saveStudent(
  //   @Param('studentId') studentId: string,
  //   @GetUser() company: Company,
  // ) {
  //   return this.companyService.saveStudent(company, studentId);
  // }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Post('/applicants/decline')
  declineStudent(@GetUser() company: Company, @Body() dto: acceptDto) {
    return this.companyService.declineStudent(company, dto);
  }
}
