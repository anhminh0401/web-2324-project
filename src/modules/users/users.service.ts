import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserAdvance } from './entities/user-advance.entity';
import { InfoProfileRequest, InfoProfileResponse } from './dtos/profile.dto';
import { Errors } from '../../helper/errors';
import { AppDataSource } from '../../database/connect-database';

@Injectable()
export class UsersService {
  public findOne = async (email: string): Promise<User | undefined> => {
    return User.findOne({ where: { email: email } });
  };

  public getProfile = async (userId: number) => {
    const user = User.findOne({ where: { userId: userId } });
    const userAdvance = UserAdvance.findOne({ where: { userId: userId } });
    const data = await Promise.all([user, userAdvance]);
    const result = InfoProfileResponse.fromDatabase({ ...data[0], ...data[1] });
    return result;
  };

  public editProfile = async (userId: number, info: InfoProfileRequest) => {
    const user = await User.findOne({
      where: { userId: userId },
    });
    if (!user) {
      throw Errors.findNotFoundUser;
    }

    await AppDataSource.transaction(async (transaction) => {
      if (user.fullname !== info.fullname) {
        await transaction.update(
          User,
          {
            userId: userId,
          },
          { fullname: info.fullname },
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fullname, ...infoUserAdvance } = info;
      await transaction.save(UserAdvance, {
        userId: userId,
        ...infoUserAdvance,
      });
    });
    return true;
  };
}
