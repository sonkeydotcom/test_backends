import { Body, Controller, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiTags } from '@nestjs/swagger';
import { companyDto, companyLoginDto } from './dto/company.dto';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }
  
  @Post('create')
    // allow this endpoint to receive media files
  companyCreateAccount(@Body() create: companyDto) {
    return this.companyService.createCompanyAccount(create)
    
    }
  @Post('login')
  companyLogin(@Body() dto: companyLoginDto) {
    return this.companyService.login(dto)
  }


  




}
