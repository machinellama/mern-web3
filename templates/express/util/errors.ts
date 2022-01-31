import { Response as ExResponse, Request as ExRequest, NextFunction } from 'express';
import { Exception, ValidateError } from 'tsoa';

export class CustomError extends Error implements Exception {
  detail?: string;
  instance?: string;
  status: number;
  title?: string;
  type?: string;
  constructor(params: ICustomError) {
    super();
    this.detail = params.detail;
    this.instance = params.instance;
    this.status = params.status;
    this.title = params.title;
    this.type = params.type;
  }
}

export interface ICustomError {
  detail?: string;
  instance?: string;
  status: number;
  title?: string;
  type?: string;
}

export default function errorHandler(error: any, req: ExRequest, res: ExResponse, next: NextFunction): ExResponse | void {
  if (error.status) {
    return res.status(error.status).json({
      ...error
    });
  }

  if (error instanceof ValidateError) {
    return res.status(422).json({
      message: 'Validation Failed',
      details: error?.fields
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }

  next();
}