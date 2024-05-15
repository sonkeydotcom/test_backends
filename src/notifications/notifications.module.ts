import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentNotification } from './entity/notification.entity';
import { Student } from 'src/students/entity/student.entity';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [
    TypeOrmModule.forFeature([StudentNotification, Student]),
    PassportModule,
    AuthModule,
  ],
})
export class NotificationsModule {}
