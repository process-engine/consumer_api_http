import {NextFunction, Response} from 'express';

import {UnauthorizedError} from '@essential-projects/errors_ts';
import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';
import {IIdentityService} from '@essential-projects/iam_contracts';

export type MiddlewareFunction = (request: HttpRequestWithIdentity, response: Response, next: NextFunction) => Promise<void>;

export function createResolveIdentityMiddleware(identityService: IIdentityService): MiddlewareFunction {

  return async (request: HttpRequestWithIdentity, response: Response, next: NextFunction): Promise<void> => {
    const bearerToken = request.get('authorization');

    if (!bearerToken) {
      throw new UnauthorizedError('No auth token provided!');
    }

    const authToken = bearerToken.substr('Bearer '.length);

    const resolvedIdentity = await identityService.getIdentity(authToken);

    request.identity = resolvedIdentity;

    next();
  };
}
