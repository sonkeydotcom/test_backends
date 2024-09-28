import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GlobalPaginationDto {
  @ApiProperty()
  @IsOptional()
  pageNumber: number;

  @ApiProperty()
  @IsOptional()
  limit: number;

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
