import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Company } from '../../company/entity/company.entity';
import { User } from '../entities/users.entity';

export const GetCompany = createParamDecorator((_data, ctx: ExecutionContext): Company => {
    const req = ctx.switchToHttp().getRequest()
    return req.company
})

export const GetUser = createParamDecorator((_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest()
    return req.user
} )