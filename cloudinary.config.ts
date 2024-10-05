import { v2 as cloudinary } from 'cloudinary';

import { ConfigService } from '@nestjs/config';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryConfig {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }
}
