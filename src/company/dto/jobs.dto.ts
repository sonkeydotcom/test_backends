import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  level: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  industry: string;
}
