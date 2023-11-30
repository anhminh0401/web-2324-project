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
  serverError: new CustomError('serverError', 'Đã có lỗi xảy ra', 500),
  badRequest: new CustomError('badRequest', 'Thiếu thông tin'),
  cannotInsertUser: new CustomError(
    'cannotInsertUser',
    'Không thể thêm người dùng',
  ),
  existUsername: new CustomError('existUsername', 'Tên người dùng đã tồn tại'),
  cannotSignIn: new CustomError(
    'cannotSignIn',
    'Tên đăng nhập hoặc mật khẩu không đúng',
  ),
  findNotFoundUser: new CustomError(
    'findNotFoundUser',
    'Không tìm thấy người dùng',
  ),
  notHaveRole: new CustomError('notHaveRole', 'not have role'),
  notActiveUser: new CustomError(
    'notActiveUser',
    'Tài khoản chưa được kích hoạt',
  ),
  verifyFailed: new CustomError('verifyFailed', 'Xác thực thất bại'),
  activeAccount: new CustomError('activeAccount', 'Tài khoản đã được xác thực'),
  incorrectPassword: new CustomError(
    'incorrectPassword',
    'Mật khẩu không đúng',
  ),
};
