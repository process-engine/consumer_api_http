import {BaseRouter} from '@essential-projects/http_node';
import {IConsumerApiController, IConsumerApiRouter, restSettings} from '@process-engine/consumer_api_contracts';

import {wrap} from 'async-middleware';

import {NextFunction, Request, Response} from 'express';

export class ConsumerApiRouter extends BaseRouter implements IConsumerApiRouter {

  private _consumerApiRestController: IConsumerApiController;

  constructor(consumerApiRestController: IConsumerApiController) {
    super();
    this._consumerApiRestController = consumerApiRestController;
  }

  private get consumerApiRestController(): IConsumerApiController {
    return this._consumerApiRestController;
  }

  public get baseRoute(): string {
    return 'api/consumer/v1';
  }

  public async initializeRouter(): Promise<void> {

    // process-model-routes
    this.router.get(restSettings.paths.processModels,
                    wrap(this.consumerApiRestController.getProcessModels.bind(this.consumerApiRestController)));

    this.router.get(restSettings.paths.processModelByKey,
                    wrap(this.consumerApiRestController.getProcessModelByKey.bind(this.consumerApiRestController)));

    this.router.post(restSettings.paths.startProcess,
                     wrap(this.consumerApiRestController.startProcess.bind(this.consumerApiRestController)));

    this.router.post(restSettings.paths.startProcessAndAwaitEndEvent,
                     wrap(this.consumerApiRestController.startProcessAndAwaitEndEvent.bind(this.consumerApiRestController)));

    // event-routes
    this.router.get(restSettings.paths.processModelEvents,
                    wrap(this.consumerApiRestController.getEventsForProcessModel.bind(this.consumerApiRestController)));

    this.router.get(restSettings.paths.correlationEvents,
                    wrap(this.consumerApiRestController.getEventsForCorrelation.bind(this.consumerApiRestController)));

    this.router.get(restSettings.paths.processModelCorrelationEvents,
                    wrap(this.consumerApiRestController.getEventsForProcessModelInCorrelation.bind(this.consumerApiRestController)));

    this.router.post(restSettings.paths.triggerEvent,
                     wrap(this.consumerApiRestController.triggerEvent.bind(this.consumerApiRestController)));

    // user-task-routes
    this.router.get(restSettings.paths.processModelUserTasks,
                    wrap(this.consumerApiRestController.getUserTasksForProcessModel.bind(this.consumerApiRestController)));

    this.router.get(restSettings.paths.correlationUserTasks,
                    wrap(this.consumerApiRestController.getUserTasksForCorrelation.bind(this.consumerApiRestController)));

    this.router.get(restSettings.paths.processModelCorrelationUserTasks,
                    wrap(this.consumerApiRestController.getUserTasksForProcessModelInCorrelation.bind(this.consumerApiRestController)));

    this.router.post(restSettings.paths.finishUserTask,
                     wrap(this.consumerApiRestController.finishUserTask.bind(this.consumerApiRestController)));
  }
}
