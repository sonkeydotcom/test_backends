import { CanActivate, ExecutionContext, Logger, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "../entities/users.entity";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

export const Roles = (...roles: string[]) => SetMetadata(UserRole, roles)

export class RoleGuard implements CanActivate {
    private readonly logger = new Logger(AuthService.name)
    constructor(private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const { user } = context.switchToHttp().getRequest()
        if (user.role !== UserRole.ADMIN) {
            throw new UnauthorizedException('unauthorized, not allowed. Contact admin')

        }
        return true
    }
}