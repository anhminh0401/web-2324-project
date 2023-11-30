import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  ChangePasswordDto,
  ForgotAccountDto,
  GoogleLoginDto,
  RegisterDto,
} from './dtos/auth.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Errors } from '../../helper/errors';
import { hashPassword } from '../../helper/utils';
import { AppDataSource } from '../../database/connect-database';
import { EmailService } from '../mail/email.service';
import { UserAdvance } from '../users/entities/user-advance.entity';
import { InfoUserResponse } from './dtos/info-user.dto';

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
    user['access_token'] = await this.jwtService.signAsync(payload);
    const result = InfoUserResponse.fromDatabase(user);
    return result;
  }

  public register = async (params: RegisterDto) => {
    const { email, password, fullname } = params;
    // find username
    const user = await this.usersService.findOne(email);
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

  public forgotAccount = async (params: ForgotAccountDto) => {
    const { email } = params;
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw Errors.findNotFoundUser;
    }
    if (!user.isActive) {
      throw Errors.notActiveUser;
    }
    const newPass = uuidv4().slice(0, 8);
    const hashPass = await hashPassword(newPass);
    // save db
    await AppDataSource.transaction(async (transaction) => {
      const userUpdate = await transaction.update(
        User,
        { userId: user.userId },
        {
          password: hashPass,
        },
      );
      if (!userUpdate) throw Errors.badRequest;
    });
    // send email
    await this.emailService.sendEmail(email, 'New password', newPass);
    return true;
  };

  public changePassword = async (params: ChangePasswordDto, userId: number) => {
    const { password, newPassword } = params;
    const user = await User.findOne({ where: { userId: userId } });
    if (!user) Errors.findNotFoundUser;
    if (!user.isActive) Errors.notActiveUser;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw Errors.incorrectPassword;
    }

    const hashPass = await hashPassword(newPassword);

    await AppDataSource.transaction(async (transaction) => {
      const userUpdate = await transaction.update(
        User,
        { userId: user.userId },
        {
          password: hashPass,
        },
      );
      if (!userUpdate) throw Errors.badRequest;
    });
    return true;
  };

  public googleLogin = async (user: GoogleLoginDto) => {
    if (!user) {
      throw Errors.cannotSignIn;
    }

    const findUser = await User.findOne({
      where: {
        email: user.email,
      },
    });
    let userResult: User = findUser;
    if (findUser) {
      await AppDataSource.transaction(async (transaction) => {
        const userUpdate = await transaction.save(UserAdvance, {
          userId: findUser.userId,
          avatar: user.avatar,
        });
        if (!userUpdate) throw Errors.badRequest;
      });
    } else {
      await AppDataSource.transaction(async (transaction) => {
        const userUpdate = await transaction.save(User, {
          email: user.email,
          uuid: uuidv4(),
          isActive: true,
          fullname: user.displayName,
        });
        if (!userUpdate) throw Errors.badRequest;

        const userAdvance = await transaction.save(UserAdvance, {
          userId: userUpdate.userId,
          avatar: user.avatar,
        });
        if (!userAdvance) throw Errors.badRequest;
        userResult = userUpdate;
      });
    }

    const payload = { userId: userResult.userId, email: userResult.email };
    userResult['access_token'] = await this.jwtService.signAsync(payload);
    const result = InfoUserResponse.fromDatabase(userResult);
    return result;
  };
}
