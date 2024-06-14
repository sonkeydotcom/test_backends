import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Company } from '../../company/entity/company.entity';
import { User } from '../entities/users.entity';
import { Student } from 'src/students/entity/student.entity';

export const GetCompany = createParamDecorator(
  (_data, ctx: ExecutionContext): Company => {
    const req = ctx.switchToHttp().getRequest();
    return req.company;
  },
);

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);

export const GetStudent = createParamDecorator(
  (_data, ctx: ExecutionContext): Student => {
    const req = ctx.switchToHttp().getRequest();
    return req.student;
  },
);
