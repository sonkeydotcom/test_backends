import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { Repository } from 'typeorm';
import { companyDto, companyLoginDto } from './dto/company.dto';
import { coreErrorHelper } from 'src/core/helpers/error.helper';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async createCompanyAccount(dto: companyDto) {
    try {
      const checkIf = await this.companyRepository.findOne({
        where: {
          email: dto.email
        }
      })

      if (checkIf) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'the company account already exist'
        }
      }

      const createCompany = this.companyRepository.create({
        address: dto.address,
        companyId: dto.companyId,
        email: dto.email,
        it_duration: dto.it_duration,
        password: dto.password,
        student_capacity: dto.student_capacity,
        rc_number: dto.rc_number,
        name: dto.company_name,
        year_founded: dto.year_founded,
      })
      await this.companyRepository.save(createCompany)
      return {
        statusCode: HttpStatus.CREATED,
        data: createCompany,
        message: 'account created successful'
      };
    } catch (err) {
      return coreErrorHelper(err)
    }
  }

  async login(dto: companyLoginDto) {
    try {
      const { email, password, rc_number } = dto;
      const findCompany = await this.companyRepository.findOne({
        where: {
          email,
        },
      });
      // check if the password matches
      if (rc_number === findCompany.rc_number) {
        return {
          statusCode: HttpStatus.OK,
          data: findCompany,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }
    } catch (err) {
      return coreErrorHelper(err);
    }
  }
}
