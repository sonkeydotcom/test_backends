import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { Repository } from 'typeorm';
import { GlobalPaginationDto } from 'src/core/dto/pagination.dto';
import { globalPaginationHelper } from 'src/core/helpers/paginationHelper';
import { globalApiResponseDto } from 'src/core/dto/global-api.dto';
import { StudentDto } from './dto/student.dto';
import { isValid } from 'date-fns';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async getSearchingStudent(
    studentDto: StudentDto,
    dto: GlobalPaginationDto,
  ): Promise<globalApiResponseDto> {
    const { accepted, searching, applied, shortlisted } = studentDto;
    const { skip, take } = globalPaginationHelper(dto);
    const whereClause: any = {};
    if (dto.date) {
      if (!isValid(new Date(dto.date))) {
        throw new BadRequestException(
          'The date is invalid. Please input a valid date (YYYY-MM-DD)',
        );
      }
      whereClause.createdDate = new Date(dto.date);
    }
    whereClause.searching = searching;

    const [data, count] = await this.studentRepository.find({
      where: whereClause,
      relations: {
        ...(accepted && accepted === true
          ? {
              acceptedApplicants: true,
            }
          : applied && applied === true
            ? {
                appliedStudent: true,
              }
            : shortlisted && shortlisted === true
              ? {
                  shortlistedApplicants: true,
                }
              : undefined),
      },
      skip,
      take,
    });
    return {
      message: 'successful',
      data: data,
      statusCode: HttpStatus.OK,
      totalCount: count,
    };
  }
}
