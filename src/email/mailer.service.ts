import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      from: '"I-Tapp" <your-email@example.com>',
      subject: 'Welcome to I-Tapp!',
      template: 'welcome',
      context: { firstName },
      text: `Hello ${firstName}, Welcome to I-Tapp, !`,
    });
  }
}
