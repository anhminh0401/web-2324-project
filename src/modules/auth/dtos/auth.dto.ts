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

export class ChangePasswordDto {
  password: string;
  newPassword: string;
}

export class GoogleLoginDto {
  googleId: string;
  email: string;
  displayName: string;
  avatar: string;
}
