import { ApiProperty } from "@nestjs/swagger";

export class NotificationDto {
    @ApiProperty()
    title: string

    @ApiProperty()
    body: string

    
}