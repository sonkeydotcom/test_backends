import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTBody } from './auth.types';
import { AuthService } from '../auth.service';
import { User } from '../entities/users.entity';
import { Company } from 'src/company/entity/company.entity';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_KEY'),
    });
  }

  // should return a user or a company
  async validate(payload: JWTBody): Promise<User | Company> {
    return this.authService.validateGetUserOnReq(payload);
  }
}
