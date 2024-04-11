import { ApiProperty } from '@nestjs/swagger';

export class globalApiResponseDto {
  @ApiProperty()
  data?: unknown;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error?: string;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  totalCount?: any
}
