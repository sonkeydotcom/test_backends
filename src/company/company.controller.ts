import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { companyDto, companyLoginDto } from './dto/company.dto';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { CreateJobDto } from './dto/jobs.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/auth/entities/users.entity';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Company } from './entity/company.entity';

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
  @Get('/profile')
  getCompanyProfile(@GetUser() company: Company) {
    return this.companyService.getCompanyProfile(company);
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
  @Get('/category')
  applicantsByCategory(@GetUser() company: Company) {
    return this.companyService.getApplicantsByCategory(company);
  }
}
