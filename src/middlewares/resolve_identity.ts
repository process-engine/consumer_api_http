import {NextFunction, Response} from 'express';

import {UnauthorizedError} from '@essential-projects/errors_ts';
import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';
import {IIdentity, IIdentityService} from '@essential-projects/iam_contracts';

export type MiddlewareFunction = (request: HttpRequestWithIdentity, response: Response, next: NextFunction) => Promise<void>;

export function createResolveIdentityMiddleware(identityService: IIdentityService): MiddlewareFunction {

  return async(request: HttpRequestWithIdentity, response: Response, next: NextFunction): Promise<void> => {
    const bearerToken: string = request.get('authorization');

    if (!bearerToken) {
      throw new UnauthorizedError('No auth token provided!');
    }

    const jwt: string = bearerToken.substr('Bearer '.length);

    const resolvedIdentity: IIdentity = await identityService.getIdentity(jwt);

    request.identity = resolvedIdentity;

    next();
  };
}
