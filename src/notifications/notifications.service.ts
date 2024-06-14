import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentNotification } from './entity/notification.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/students/entity/student.entity';
import { NotificationDto } from './dto/notification.dto';
import { coreErrorHelper } from 'src/core/helpers/error.helper';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { globalPaginationHelper } from 'src/core/helpers/paginationHelper';
import { isValid } from 'date-fns';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(StudentNotification)
    private notificationRepository: Repository<StudentNotification>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async createStudentNotification({
    notificationDto,
    student,
  }: {
    student: Student;
    notificationDto: NotificationDto;
  }) {
    try {
      const { body, title } = notificationDto;
      const createNew = this.notificationRepository.create({
        body: body,
        title: title,
        student: {
          id: student.id,
        },
      });
      await this.notificationRepository.save(createNew);
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getNotificationById(
    id: string,
    student: Student,
  ): Promise<globalApiResponseDto> {
    try {
      const getSingleNotification = await this.notificationRepository.findOne({
        where: {
          id,
          student: {
            id: student.id,
          },
        },
        relations: {
          student: true,
        },
      });
      if (!getSingleNotification) {
        throw new NotFoundException('the id does not exist');
      }
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: getSingleNotification,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getAllNotificationPerStudent(
    student: Student,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    try {
      const { skip, take } = globalPaginationHelper(dto);

      if (dto.date) {
        if (!isValid(new Date(dto.date))) {
          throw new BadRequestException(
            'The date is invalid. Please input a valid date (YYYY-MM-DD)',
          );
        }
      }
      const [data, count] = await this.notificationRepository.findAndCount({
        where: {
          student: {
            id: student.id,
          },
          createdAt: new Date(dto.date),
        },
        relations: {
          student: true,
        },
        skip,
        take,
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: data,
        totalCount: count,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async getNotificationCount(student: Student): Promise<globalApiResponseDto> {
    try {
      const getCount = await this.notificationRepository.count({
        where: {
          student: {
            id: student.id,
          },
        },
      });
      return {
        message: 'successful',
        statusCode: HttpStatus.OK,
        data: getCount,
      };
    } catch (err) {
      return coreErrorHelper(err);
    }
  }

  async runHealthCheck(): Promise<globalApiResponseDto> {
    console.log(
      '=========================== Health Check ============================',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'successful and alive',
    };
  }
}
