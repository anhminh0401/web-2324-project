import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.FROM_EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}