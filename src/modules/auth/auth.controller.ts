import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotAccountDto, RegisterDto, SignInDto } from './dtos/auth.dto';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const data = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const data = await this.authService.register(registerDto);
    res.send(new ResponseWrapper(data, null, null));
  }

  @Get('active/:uuid')
  async activeAccount(@Param('uuid') uuid: string, @Res() res: Response) {
    const data = await this.authService.activeAccount(uuid);
    res.send(new ResponseWrapper(data, null, null));
  }

  @Post('forgot')
  async forgotAccount(
    @Body() forgotAccountDto: ForgotAccountDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.forgotAccount(forgotAccountDto);
    res.send(new ResponseWrapper(data, null, null));
  }
}
