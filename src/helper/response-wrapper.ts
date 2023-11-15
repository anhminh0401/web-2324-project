import { CustomError } from './errors';

export class ResponseWrapper {
  data: any;
  error: CustomError;
  pagination: any;

  constructor(data: any, error: CustomError = null, pagnition: any = null) {
    this.data = data;
    this.error = error;
    this.pagination = pagnition;
  }
}

export class Pagination {
  total: number;
  page: number;
  limit: number;

  constructor(total: number, page: number = 1, limit: number = 10) {
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
