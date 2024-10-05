import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    const uploadStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return await cloudinary.uploader.upload(uploadStr, {
      resource_type: 'auto', // Automatically detects the file type
      folder, // e.g., 'profile_images', 'background_images', 'documents'
      use_filename: true,
      unique_filename: false,
    });
  }
}
