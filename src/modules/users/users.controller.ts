import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { InfoProfileRequest } from './dtos/profile.dto';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req, @Res() res: Response) {
    const data = await this.usersService.getProfile(req.user.userId);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  async editProfile(
    @Body() info: InfoProfileRequest,
    @Request() req,
    @Res() res: Response,
  ) {
    const data = await this.usersService.editProfile(req.user.userId, info);
    res.send(new ResponseWrapper(data, null, null));
  }
}
