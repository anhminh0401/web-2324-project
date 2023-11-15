import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, SignInDto } from './dtos/auth.dto';
import { Response } from 'express';
import { ResponseWrapper } from 'src/helper/response-wrapper';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const data = await this.authService.signIn(
      signInDto.username,
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
}
