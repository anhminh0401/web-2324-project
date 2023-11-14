import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  public findOne = async (username: string): Promise<User | undefined> => {
    return User.findOne({ where: { username: username } });
  };
}
