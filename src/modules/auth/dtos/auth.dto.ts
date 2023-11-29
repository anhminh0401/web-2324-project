export class SignInDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
  fullname: string;
}

export class ForgotAccountDto {
  email: string;
}
