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
      subject: `[wnc-2324] ${subject}`,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendConfirmationEmail(
    email: string,
    classId: number,
    role: 'student' | 'teacher',
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Invite to join the class',
      html: `<p>Xác nhận đồng ý <a href="${process.env.BASE_URL}/class/confirm?email=${email}&classId=${classId}&role=${role}">Tại đây</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
