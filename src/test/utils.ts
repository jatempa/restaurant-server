import type { Request, Response } from 'express';

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    body: {},
    query: {},
    ...overrides,
  } as Request;
}

export function createMockResponse(): Response {
  const res = {
    statusCode: 200,
    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    json: (data: unknown) => {
      res._jsonData = data;
      return res;
    },
    send: () => res,
    _jsonData: undefined as unknown,
  };
  return res as Response & { _jsonData?: unknown };
}
