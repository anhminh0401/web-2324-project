export class CustomError extends Error {
  status: number;
  code: string;
  message: string;

  constructor(code: string, message: string, status?: number) {
    super();
    this.code = code;
    this.message = message;
    this.status = status;
  }
}

export const Errors = {
  serverError: new CustomError('serverError', 'Something error in server', 500),
  badRequest: new CustomError('badRequest', 'Miss info'),
  cannotInsertUser: new CustomError('cannotInsertUser', 'Cannot insert user'),
  existUsername: new CustomError('existUsername', 'username existed'),
  cannotSignIn: new CustomError('cannotSignIn', 'username or password wrong'),
  findNotFoundUser: new CustomError('findNotFoundUser', 'userId do not exist'),
};
