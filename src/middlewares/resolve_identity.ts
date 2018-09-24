import {NextFunction, Response} from 'express';

import {UnauthorizedError} from '@essential-projects/errors_ts';
import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';
import {IIdentity} from '@essential-projects/iam_contracts';

export function resolveIdentity(request: HttpRequestWithIdentity, response: Response, next: NextFunction): void {
  const bearerToken: string = request.get('authorization');

  if (!bearerToken) {
    throw new UnauthorizedError('No auth token provided!');
  }

  request.identity = <IIdentity> {
    token: bearerToken.substr('Bearer '.length),
  };

  next();
}
