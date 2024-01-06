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
import { InfoMssvRequest, InfoProfileRequest } from './dtos/profile.dto';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(AuthGuard)
  @Post('map-mssv')
  async mapMSSV(
    @Body() info: InfoMssvRequest,
    @Request() req,
    @Res() res: Response,
  ) {
    const data = await this.usersService.mapMSSV(req.user.userId, info.mssv);
    res.send(new ResponseWrapper(data, null, null));
  }
}
