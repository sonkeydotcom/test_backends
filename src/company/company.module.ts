import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { Jobs } from './entity/jobs.entity';
import { ShortlistedApplicant } from './entity/applicant/shortlisted-applicant.entity';
import { AcceptedApplicants } from './entity/applicant/accepted-applicant.entity';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Jobs,
      ShortlistedApplicant,
      AcceptedApplicants,
    ]),
  ],
})
export class CompanyModule {}
