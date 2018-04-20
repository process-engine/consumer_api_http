import {UnauthorizedError} from '@essential-projects/errors_ts';
import {ConsumerRequest} from '@process-engine/consumer_api_contracts';
import {NextFunction, Response} from 'express';

export function resolveCustomerContext(request: ConsumerRequest, response: Response, next: NextFunction): void {
  const bearerToken: string = request.get('authorization');

  if (!bearerToken) {
    throw new UnauthorizedError('No auth token provided!');
  }

  request.consumerContext = {
    identity: bearerToken.substr('Bearer '.length),
    Internationalization: request.get('accept-language'),
  };

  next();
}
