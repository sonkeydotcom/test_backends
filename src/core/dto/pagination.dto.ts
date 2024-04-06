import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsEnum, IsEmail, IsBoolean } from "class-validator";

export enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GlobalPaginationDto {
  @ApiProperty()
  @IsNotEmpty()
  pageNumber: number;

  @ApiProperty()
  @IsNotEmpty()
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

}
