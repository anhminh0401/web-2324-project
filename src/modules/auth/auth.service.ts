import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dtos/auth.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Errors } from '../../helper/errors';
import { hashPassword } from '../../helper/utils';
import { AppDataSource } from '../../database/connect-database';
import { EmailService } from '../mail/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw Errors.cannotSignIn;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw Errors.cannotSignIn;
    }

    if (!user.isActive) {
      throw Errors.notActiveUser;
    }

    const payload = { userId: user.userId, email: user.email };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    result['access_token'] = await this.jwtService.signAsync(payload);
    return {
      ...result,
    };
  }

  public register = async (params: RegisterDto) => {
    const { email, password, fullname } = params;
    // find username
    const user = await this.usersService.findOne(email);
    console.log(
      '🚀 ~ file: auth.service.ts:42 ~ AuthService ~ register= ~ user:',
      user,
    );
    if (user) {
      throw Errors.existUsername;
    }

    const hashPass = await hashPassword(password);
    const uuid = uuidv4();
    // save db
    await AppDataSource.transaction(async (transaction) => {
      const user = await transaction.save(User, {
        email: email,
        password: hashPass,
        fullname: fullname,
        uuid: uuid,
      });
      if (!user) throw Errors.cannotInsertUser;
    });
    // send email
    const activationLink = `${process.env.BASE_URL}/auth/active/${uuid}`;
    await this.emailService.sendEmail(email, 'Active account', activationLink);
    return true;
  };

  public activeAccount = async (uuid: string) => {
    console.log(' uuid', uuid);
    const user = await User.findOne({
      where: {
        uuid: uuid,
      },
    });
    if (!user) throw Errors.verifyFailed;
    if (user.isActive) throw Errors.activeAccount;

    // save db
    await AppDataSource.transaction(async (transaction) => {
      const userUpdate = await transaction.update(
        User,
        { uuid: uuid, userId: user.userId },
        {
          isActive: true,
        },
      );
      if (!userUpdate) throw Errors.verifyFailed;
    });
    return true;
  };
}
