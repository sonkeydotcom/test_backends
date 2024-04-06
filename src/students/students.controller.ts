import { Controller } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // let admin get all the list of accepted students
  // get the list of students accepted in the last 24hr
  // get students by week, month, year

  // get the list of students that are searching
  // get the list of companies, return the following data {company, registered on, location, no. of accepted applicants} paginate the data
}
