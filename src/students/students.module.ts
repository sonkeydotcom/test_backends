import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { Jobs } from 'src/company/entity/jobs.entity';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [AuthModule, TypeOrmModule.forFeature([Student, Jobs])],
})
export class StudentsModule {}
