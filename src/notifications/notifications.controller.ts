import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Student } from 'src/students/entity/student.entity';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/:id')
  getNotifiedById(@Param('id') id: string, @GetUser() student: Student) {
    return this.notificationsService.getNotificationById(id, student);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/all')
  getAll(@GetUser() student: Student, @Query() dto: GlobalPaginationDto) {
    return this.notificationsService.getAllNotificationPerStudent(student, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/count')
  getNotificationCount(@GetUser() student: Student) {
    return this.notificationsService.getNotificationCount(student);
  }

  // @Cron(CronExpression.EVERY_30_SECONDS)
}
