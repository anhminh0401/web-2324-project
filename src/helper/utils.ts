import bcrypt from 'bcrypt';

export const hashPassword = async (pass: string) => {
  return bcrypt.hash(pass, 10);
};
