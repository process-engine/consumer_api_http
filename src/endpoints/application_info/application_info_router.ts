import {wrap} from 'async-middleware';
import {NextFunction, Request, Response} from 'express';

import {BaseError} from '@essential-projects/errors_ts';
import {BaseRouter} from '@essential-projects/http_node';

import {restSettings} from '@process-engine/consumer_api_contracts';

import {ApplicationInfoController} from './application_info_controller';

export class ApplicationInfoRouter extends BaseRouter {

  private applicationInfoController: ApplicationInfoController;

  constructor(applicationInfoController: ApplicationInfoController) {
    super();
    this.applicationInfoController = applicationInfoController;
  }

  public get baseRoute(): string {
    return 'api/consumer/v1';
  }

  public async initializeRouter(): Promise<void> {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    const controller = this.applicationInfoController;

    this.router.get(restSettings.paths.getApplicationInfo, errorHandler, wrap(controller.getApplicationInfo.bind(controller)));
  }

}

// TODO:
// There is a bug with either the HTTP extension, express, or the BaseRouter, which causes the "resolveIdentity" middleware to be applied to
// ALL of the consumer api routers, even if they do not make explicit use of that middleware.
// Since this route is designed to be used without the need of any identity, we need to intercept the 401 errors here
// that the middleware throws, if no auth token is provided.
function errorHandler(error: BaseError, request: Request, response: Response, next: NextFunction): void {
  if (error.code === 401) {
    next();
  } else {
    next(error);
  }
}
