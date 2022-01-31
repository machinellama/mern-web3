import { Request as ExRequest } from 'express';
import jwt from 'jsonwebtoken';

import { CustomError } from './errors';
import { User } from '../api/users/user';
import config from '../../config';

const EXPIRATION_HOURS = 24;
const DEFAULT_DURATION = EXPIRATION_HOURS * 60 * 60; // seconds for expiration

/**
 * Create/sign a new jsonwebtoken
 * duration = seconds
 */
export function createJWT(req: ExRequest, user: User, duration: number = DEFAULT_DURATION): string {
  const token = jwt.sign(user, config.authentication.secret, {
    expiresIn: duration
  });

  return token;
}

/**
 * Validate a given jsonwebtoken
 * duration = seconds
 */
export function validateJWT(req: ExRequest): User {
  try {
    const token = getToken(req);
    const decodedUser = jwt.verify(token, config.authentication.secret);

    return decodedUser;
  } catch (e) {
    throw new CustomError({
      detail: 'Unauthorized',
      instance: req.url,
      status: 401,
      title: 'unauthorized',  // maps to translations
      type: 'Unauthorized'
    });
  }
}

export function getToken(req: ExRequest) {
  let token;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    throw new CustomError({
      detail: 'No token provided, unauthorized',
      instance: req.url,
      status: 401,
      title: 'unauthorized',  // maps to translations
      type: 'Unauthorized'
    });
  }

  return token;
}
