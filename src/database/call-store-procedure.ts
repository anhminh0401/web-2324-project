import { EntityManager } from 'typeorm';
import { AppDataSource } from './connect-database';
import { plainToInstance } from 'class-transformer';

export const callProcedure = async <T>(
  nameStore: string,
  paramsQuery: unknown[],
  cls?,
) => {
  let questionMarks = '';
  for (let i = 0; i < paramsQuery.length; i++) {
    if (i !== paramsQuery.length - 1) questionMarks += '?,';
    else questionMarks += '?';
  }
  const connect: EntityManager = AppDataSource.createEntityManager();
  const data = await connect.query(
    `call ${nameStore}(${questionMarks})`,
    paramsQuery,
  );
  if (cls === undefined) return data?.[0]?.[0] as T;
  return plainToInstance(cls, data[0], {
    excludeExtraneousValues: true,
  }) as T;
};
