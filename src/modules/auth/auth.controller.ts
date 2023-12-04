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
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotAccountDto,
  RegisterDto,
  SignInDto,
} from './dtos/auth.dto';
import { Response } from 'express';
import { ResponseWrapper } from '../../helper/response-wrapper';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

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

  @Post('forgot-password')
  async forgotAccount(
    @Body() forgotAccountDto: ForgotAccountDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.forgotAccount(forgotAccountDto);
    res.send(new ResponseWrapper(data, null, null));
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const data = await this.authService.changePassword(
      changePasswordDto,
      req.user.userId,
    );
    res.send(new ResponseWrapper(data, null, null));
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const data: any = await this.authService.googleLogin(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/google?access_token=${data.access_token}&email=${data.email}&fullname=${data.fullname}&userId=${data.userId}`);
  }
}
