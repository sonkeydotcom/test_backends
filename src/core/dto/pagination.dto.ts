import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GlobalPaginationDto {
  @ApiProperty({ default: 1 })
  @IsOptional()
  pageNumber: number = 1;

  @ApiProperty({ default: 10 })
  @IsOptional()
  limit: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  orderBy?: string;

  @ApiProperty({
    enum: OrderEnum,
    required: false,
  })
  @IsEnum(OrderEnum)
  @IsOptional()
  order?: 'ASC' | 'DESC';

  @ApiProperty({ required: false })
  @IsOptional()
  date: string;
}
