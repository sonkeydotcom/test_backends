import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { Jobs } from 'src/company/entity/jobs.entity';
import { Company } from 'src/company/entity/company.entity';
import { SavedApplications } from './entity/saved.entity';
import { AppliedStudents } from 'src/company/entity/applied-applicants.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AcceptedApplicants } from 'src/company/entity/accepted-applicant.entity';
@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [
    AuthModule,
    CloudinaryModule,
    TypeOrmModule.forFeature([
      Student,
      Jobs,
      SavedApplications,
      AppliedStudents,
      Company,
      AcceptedApplicants,
    ]),
  ],
})
export class StudentsModule {}
