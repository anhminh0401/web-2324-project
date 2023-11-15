import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { InfoProfileRequest } from './dtos/profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  editProfile(@Body() info: InfoProfileRequest, @Request() req) {
    return this.usersService.editProfile(req.user.userId, info);
  }
}
