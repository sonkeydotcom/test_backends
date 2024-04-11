import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/auth/entities/users.entity';
import { RoleGuard, Roles } from 'src/auth/guard/roles.guard';
import { StudentDto } from './dto/student.dto';

@ApiTags('Student')
@Controller('students')
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

  @Get('/admin/data')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(UserRole.ADMIN)
  getStudentData(
    @Query() dto: GlobalPaginationDto,
    @Query() studentDto: StudentDto,
  ) {
    return this.studentsService.getStudentData(studentDto, dto);
  }
}
