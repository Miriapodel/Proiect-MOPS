import { jest } from '@jest/globals';

const create = jest.fn();
const findMany = jest.fn();
const findUnique = jest.fn();
const update = jest.fn();
const deleteRecord = jest.fn();

export const prisma = {
  incident: {
    create,
    findMany,
    findUnique,
    update,
    delete: deleteRecord,
  },
};
