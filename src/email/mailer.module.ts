import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAILER_HOST'),
          port: config.get('MAILER_PORT'),
          secure: config.get<number>('MAILER_PORT') === 465, // Use secure mode for port 46
          auth: {
            user: config.get('MAILER_USER'),
            pass: config.get('MAILER_PASSWORD'),
          },
        },
        defaults: {
          from: `"I-Tapp" <${config.get('MAILER_USER')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailerConfigModule {}
