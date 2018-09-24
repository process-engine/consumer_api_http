import {BaseRouter} from '@essential-projects/http_node';
import {restSettings} from '@process-engine/consumer_api_contracts';
import {ConsumerApiController} from './consumer_api_controller';
import {resolveIdentity} from './middlewares/index';

import {wrap} from 'async-middleware';

export class ConsumerApiRouter extends BaseRouter {

  private _consumerApiRestController: ConsumerApiController;

  constructor(consumerApiRestController: ConsumerApiController) {
    super();
    this._consumerApiRestController = consumerApiRestController;
  }

  private get consumerApiRestController(): ConsumerApiController {
    return this._consumerApiRestController;
  }

  public get baseRoute(): string {
    return 'api/consumer/v1';
  }

  public async initializeRouter(): Promise<void> {
    this.registerMiddlewares();
    this.registerProcessModelRoutes();
    this.registerEventRoutes();
    this.registerUserTaskRoutes();
  }

  private registerMiddlewares(): void {
    this.router.use(wrap(resolveIdentity));
  }

  private registerProcessModelRoutes(): void {
    const controller: ConsumerApiController = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModels, wrap(controller.getProcessModels.bind(controller)));
    this.router.get(restSettings.paths.processModelById, wrap(controller.getProcessModelById.bind(controller)));
    this.router.get(restSettings.paths.getProcessResultForCorrelation, wrap(controller.getProcessResultForCorrelation.bind(controller)));
    this.router.post(restSettings.paths.startProcessInstance, wrap(controller.startProcessInstance.bind(controller)));
  }

  private registerEventRoutes(): void {
    const controller: ConsumerApiController = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModelEvents, wrap(controller.getEventsForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.correlationEvents, wrap(controller.getEventsForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationEvents, wrap(controller.getEventsForProcessModelInCorrelation.bind(controller)));
    this.router.post(restSettings.paths.triggerEvent, wrap(controller.triggerEvent.bind(controller)));
  }

  private registerUserTaskRoutes(): void {
    const controller: ConsumerApiController = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModelUserTasks, wrap(controller.getUserTasksForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.correlationUserTasks, wrap(controller.getUserTasksForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationUserTasks, wrap(controller.getUserTasksForProcessModelInCorrelation.bind(controller)));
    this.router.post(restSettings.paths.finishUserTask, wrap(controller.finishUserTask.bind(controller)));
  }
}
