import {BaseRouter} from '@essential-projects/http_node';
import {IIdentityService} from '@essential-projects/iam_contracts';

import {restSettings} from '@process-engine/consumer_api_contracts';
import {ConsumerApiController} from './consumer_api_controller';
import {createResolveIdentityMiddleware, MiddlewareFunction} from './middlewares/index';

import {wrap} from 'async-middleware';

export class ConsumerApiRouter extends BaseRouter {

  private _consumerApiRestController: ConsumerApiController;
  private _identityService: IIdentityService;

  constructor(consumerApiRestController: ConsumerApiController, identityService: IIdentityService) {
    super();
    this._consumerApiRestController = consumerApiRestController;
    this._identityService = identityService;
  }

  public get baseRoute(): string {
    return 'api/consumer/v1';
  }

  public async initializeRouter(): Promise<void> {
    this._registerMiddlewares();
    this._registerProcessModelRoutes();
    this._registerEventRoutes();
    this._registerUserTaskRoutes();
    this._registerManualTaskRoutes();
  }

  private _registerMiddlewares(): void {
    const resolveIdentity: MiddlewareFunction = createResolveIdentityMiddleware(this._identityService);
    this.router.use(wrap(resolveIdentity));
  }

  private _registerProcessModelRoutes(): void {
    const controller: ConsumerApiController = this._consumerApiRestController;

    this.router.get(restSettings.paths.processModels, wrap(controller.getProcessModels.bind(controller)));
    this.router.get(restSettings.paths.processModelById, wrap(controller.getProcessModelById.bind(controller)));
    this.router.get(restSettings.paths.processModelByProcessInstanceId, wrap(controller.getProcessModelByProcessInstanceId.bind(controller)));
    this.router.get(restSettings.paths.getProcessResultForCorrelation, wrap(controller.getProcessResultForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.getOwnProcessInstances, wrap(controller.getProcessInstancesByIdentity.bind(controller)));
    this.router.post(restSettings.paths.startProcessInstance, wrap(controller.startProcessInstance.bind(controller)));
  }

  private _registerEventRoutes(): void {
    const controller: ConsumerApiController = this._consumerApiRestController;

    this.router.get(restSettings.paths.processModelEvents, wrap(controller.getEventsForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.correlationEvents, wrap(controller.getEventsForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationEvents, wrap(controller.getEventsForProcessModelInCorrelation.bind(controller)));
    this.router.post(restSettings.paths.triggerMessageEvent, wrap(controller.triggerMessageEvent.bind(controller)));
    this.router.post(restSettings.paths.triggerSignalEvent, wrap(controller.triggerSignalEvent.bind(controller)));
  }

  private _registerUserTaskRoutes(): void {
    const controller: ConsumerApiController = this._consumerApiRestController;

    this.router.get(restSettings.paths.processModelUserTasks, wrap(controller.getUserTasksForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.correlationUserTasks, wrap(controller.getUserTasksForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationUserTasks, wrap(controller.getUserTasksForProcessModelInCorrelation.bind(controller)));
    this.router.get(restSettings.paths.getOwnUserTasks, wrap(controller.getWaitingUserTasksByIdentity.bind(controller)));
    this.router.post(restSettings.paths.finishUserTask, wrap(controller.finishUserTask.bind(controller)));
  }

  private _registerManualTaskRoutes(): void {
    const controller: ConsumerApiController = this._consumerApiRestController;

    this.router.get(restSettings.paths.processModelManualTasks, wrap(controller.getManualTasksForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.correlationManualTasks, wrap(controller.getManualTasksForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationManualTasks,
       wrap(controller.getManualTasksForProcessModelInCorrelation.bind(controller)));
    this.router.get(restSettings.paths.getOwnManualTasks, wrap(controller.getWaitingManualTasksByIdentity.bind(controller)));
    this.router.post(restSettings.paths.finishManualTask, wrap(controller.finishManualTask.bind(controller)));
  }
}
