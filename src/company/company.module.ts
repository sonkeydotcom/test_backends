import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { Jobs } from './entity/jobs.entity';
import { ShortlistedApplicant } from './entity/shortlisted-applicant.entity';
import { AcceptedApplicants } from './entity/accepted-applicant.entity';
import { Student } from 'src/students/entity/student.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Company,
      Jobs,
      ShortlistedApplicant,
      AcceptedApplicants,
      Student
    ]),
  ],
})
export class CompanyModule {}
