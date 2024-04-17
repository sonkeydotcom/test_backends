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
import { Public } from 'src/auth/decorator/is-public.decorator';

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
  CompanyById(@Param('id') id: string, @Query() email?: string) {
    return this.companyService.getById(id, email);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('/admin/all')
  // @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  getAllCompanies(@Query() dto: GlobalPaginationDto) {
    return this.companyService.getAllCompanies(dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('/applicants/accepted/:companyId')
  getAllAcceptedApplicants(
    @Param('companyId') companyId: string,
    @Query() dto: GlobalPaginationDto,
  ) {
    return this.companyService.getAcceptedApplicants(companyId, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('/applicants/shortlisted/:id')
  getShortListedApplicants(
    @Param('id') id: string,
    @Query() dto: GlobalPaginationDto,
  ) {
    return this.companyService.getShortListedStudent(id, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Post('/job/new/:id')
  createNewJob(@Body() dto: CreateJobDto, @Param('id') id: string) {
    return this.companyService.createdNewJob(id, dto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('/category/:id')
  applicantsByCategory(@Param('id') id: string) {
    return this.companyService.getApplicantsByCategory(id);
  }
}
