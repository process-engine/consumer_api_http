import {BaseRouter} from '@essential-projects/http_node';
import {IIdentityService} from '@essential-projects/iam_contracts';

import {restSettings} from '@process-engine/consumer_api_contracts';
import {wrap} from 'async-middleware';
import {ConsumerApiController} from './consumer_api_controller';
import {createResolveIdentityMiddleware} from './middlewares/index';

export class ConsumerApiRouter extends BaseRouter {

  private consumerApiRestController: ConsumerApiController;
  private identityService: IIdentityService;

  constructor(consumerApiRestController: ConsumerApiController, identityService: IIdentityService) {
    super();
    this.consumerApiRestController = consumerApiRestController;
    this.identityService = identityService;
  }

  public get baseRoute(): string {
    return 'api/consumer/v1';
  }

  public async initializeRouter(): Promise<void> {
    this.registerMiddlewares();
    this.registerProcessModelRoutes();
    this.registerEventRoutes();
    this.registerEmptyActivityRoutes();
    this.registerUserTaskRoutes();
    this.registerManualTaskRoutes();
  }

  private registerMiddlewares(): void {
    const resolveIdentity = createResolveIdentityMiddleware(this.identityService);
    this.router.use(wrap(resolveIdentity));
  }

  private registerProcessModelRoutes(): void {
    const controller = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModels, wrap(controller.getProcessModels.bind(controller)));
    this.router.get(restSettings.paths.processModelById, wrap(controller.getProcessModelById.bind(controller)));
    this.router.get(restSettings.paths.processModelByProcessInstanceId, wrap(controller.getProcessModelByProcessInstanceId.bind(controller)));
    this.router.get(restSettings.paths.getProcessResultForCorrelation, wrap(controller.getProcessResultForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.getOwnProcessInstances, wrap(controller.getProcessInstancesByIdentity.bind(controller)));
    this.router.post(restSettings.paths.startProcessInstance, wrap(controller.startProcessInstance.bind(controller)));
  }

  private registerEventRoutes(): void {
    const controller = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModelEvents, wrap(controller.getEventsForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.correlationEvents, wrap(controller.getEventsForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationEvents, wrap(controller.getEventsForProcessModelInCorrelation.bind(controller)));
    this.router.post(restSettings.paths.triggerMessageEvent, wrap(controller.triggerMessageEvent.bind(controller)));
    this.router.post(restSettings.paths.triggerSignalEvent, wrap(controller.triggerSignalEvent.bind(controller)));
  }

  private registerEmptyActivityRoutes(): void {
    const controller = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModelEmptyActivities, wrap(controller.getEmptyActivitiesForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.processInstanceEmptyActivities, wrap(controller.getEmptyActivitiesForProcessInstance.bind(controller)));
    this.router.get(restSettings.paths.correlationEmptyActivities, wrap(controller.getEmptyActivitiesForCorrelation.bind(controller)));
    this.router.get(
      restSettings.paths.processModelCorrelationEmptyActivities,
      wrap(controller.getEmptyActivitiesForProcessModelInCorrelation.bind(controller)),
    );
    this.router.get(restSettings.paths.getOwnEmptyActivities, wrap(controller.getWaitingEmptyActivitiesByIdentity.bind(controller)));
    this.router.post(restSettings.paths.finishEmptyActivity, wrap(controller.finishEmptyActivity.bind(controller)));
  }

  private registerUserTaskRoutes(): void {
    const controller = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModelUserTasks, wrap(controller.getUserTasksForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.processInstanceUserTasks, wrap(controller.getUserTasksForProcessInstance.bind(controller)));
    this.router.get(restSettings.paths.correlationUserTasks, wrap(controller.getUserTasksForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationUserTasks, wrap(controller.getUserTasksForProcessModelInCorrelation.bind(controller)));
    this.router.get(restSettings.paths.getOwnUserTasks, wrap(controller.getWaitingUserTasksByIdentity.bind(controller)));
    this.router.post(restSettings.paths.finishUserTask, wrap(controller.finishUserTask.bind(controller)));
  }

  private registerManualTaskRoutes(): void {
    const controller = this.consumerApiRestController;

    this.router.get(restSettings.paths.processModelManualTasks, wrap(controller.getManualTasksForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.processInstanceManualTasks, wrap(controller.getManualTasksForProcessInstance.bind(controller)));
    this.router.get(restSettings.paths.correlationManualTasks, wrap(controller.getManualTasksForCorrelation.bind(controller)));
    this.router.get(
      restSettings.paths.processModelCorrelationManualTasks,
      wrap(controller.getManualTasksForProcessModelInCorrelation.bind(controller)),
    );
    this.router.get(restSettings.paths.getOwnManualTasks, wrap(controller.getWaitingManualTasksByIdentity.bind(controller)));
    this.router.post(restSettings.paths.finishManualTask, wrap(controller.finishManualTask.bind(controller)));
  }

}
