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

@ApiBearerAuth()
@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('create')
  // allow this endpoint to receive media files
  companyCreateAccount(@Body() create: companyDto) {
    return this.companyService.createCompanyAccount(create);
  }

  @Post('login') //TODO: make an is public endpoint for this
  companyLogin(@Body() dto: companyLoginDto) {
    return this.companyService.login(dto);
  }

  @Get(':id')
  CompanyById(@Param('id') id: string, @Query() email?: string) {
    return this.companyService.getById(id, email);
  }

  @Get('category')
  // TODO: get company via req
  applicantsByCategory(@Param('id') id: string) {
    return this.companyService.getApplicantsByCategory(id);
  }

  @Get('all')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  // TODO: protect this route for only admin
  getAllCompanies(@Query() dto: GlobalPaginationDto) {
    return this.companyService.getAllCompanies(dto);
  }

  @Get('applicants/accepted/:companyId')
  getAllAcceptedApplicants(
    @Param('companyId') companyId: string,
    @Query() dto: GlobalPaginationDto,
  ) {
    return this.companyService.getAcceptedApplicants(companyId, dto);
  }

  @Get('/applicants/shortlisted/:id')
  getShortListedApplicants(
    @Param('id') id: string,
    @Query() dto: GlobalPaginationDto,
  ) {
    return this.companyService.getShortListedStudent(id, dto);
  }

  @Post('/job/new/:id')
  createNewJob(@Body() dto: CreateJobDto, @Param('id') id: string) {
    return this.companyService.createdNewJob(id, dto);
  }
}
