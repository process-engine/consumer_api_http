import {UnauthorizedError} from '@essential-projects/errors_ts';
import {ConsumerRequest} from '@process-engine/consumer_api_contracts';

export function resolveCustomerContext(request: ConsumerRequest): void {
  const bearerToken: string = request.get('authorization');

  if (!bearerToken) {
    throw new UnauthorizedError('No auth token provided!');
  }

  // TODO: Maybe retrieve other header values?
  request.consumerContext = {
    identity: bearerToken.substr('Bearer '.length),
    Internationalization: request.get('accept-language'),
  };
}
