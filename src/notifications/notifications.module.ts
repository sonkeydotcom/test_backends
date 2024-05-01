import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentNotification } from './entity/notification.entity';
import { Student } from 'src/students/entity/student.entity';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [TypeOrmModule.forFeature([StudentNotification, Student])],
})
export class NotificationsModule {}
