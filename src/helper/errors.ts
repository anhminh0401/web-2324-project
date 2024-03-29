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
  findNotFoundClass: new CustomError(
    'findNotFoundClass',
    'Không tìm thấy lớp học',
  ),
  cannotMapMSSV: new CustomError(
    'cannotMapMSSV',
    'Không thể map mã số sinh viên',
  ),
  existMSSV: new CustomError('existMSSV', 'Mã số sinh viên đã tồn tại'),
  cannotMark: new CustomError('cannotMark', 'Không thể chấm điểm'),
  cannotImportAssignment: new CustomError(
    'cannotImportAssignment',
    'Không tìm thấy cột điểm để import',
  ),
  joinedClass: new CustomError('joinedClass', 'Đã tham gia lớp học này'),
  findNotFoundReview: new CustomError(
    'findNotFoundReview',
    'Không tìm thấy review',
  ),
  findNotFoundGrade: new CustomError(
    'findNotFoundGrade',
    'Không tìm thấy grade column',
  ),
  cannotCreateReview: new CustomError(
    'cannotCreateReview',
    'Không thể tạo review',
  ),
  accountLock: new CustomError('accountLock', 'Tài khoản của bạn đã bị khóa'),
};
