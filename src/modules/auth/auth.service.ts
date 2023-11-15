import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { hashPassword } from 'src/helper/utils';
import { RegisterDto } from './dtos/auth.dto';
import { AppDataSource } from 'src/database/connect-database';
import { User } from '../users/entities/user.entity';
import { Errors } from 'src/helper/errors';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw Errors.cannotSignIn;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw Errors.cannotSignIn;
    }

    const payload = { userId: user.userId, username: user.username };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    result['access_token'] = await this.jwtService.signAsync(payload);
    return {
      ...result,
    };
  }

  public register = async (params: RegisterDto) => {
    const { username, password, fullname } = params;
    // find username
    const user = await this.usersService.findOne(username);
    if (user) {
      throw Errors.existUsername;
    }

    const hashPass = await hashPassword(password);
    // save db
    await AppDataSource.transaction(async (transaction) => {
      const user = await transaction.save(User, {
        username: username,
        password: hashPass,
        fullname: fullname,
      });
      if (!user) throw Errors.cannotInsertUser;
    });
    return true;
  };
}
