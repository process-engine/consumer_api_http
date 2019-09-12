import {BaseRouter} from '@essential-projects/http_node';
import {IIdentityService} from '@essential-projects/iam_contracts';

import {restSettings} from '@process-engine/consumer_api_contracts';

import {wrap} from 'async-middleware';
import {createResolveIdentityMiddleware} from '../../middlewares/resolve_identity';
import {TaskController} from './task_controller';

export class TaskRouter extends BaseRouter {

  private identityService: IIdentityService;
  private taskController: TaskController;

  constructor(taskController: TaskController, identityService: IIdentityService) {
    super();
    this.taskController = taskController;
    this.identityService = identityService;
  }

  public get baseRoute(): string {
    return 'api/consumer/v1';
  }

  public async initializeRouter(): Promise<void> {
    this.registerMiddlewares();
    this.registerRoutes();
  }

  private registerMiddlewares(): void {
    const resolveIdentity = createResolveIdentityMiddleware(this.identityService);
    this.router.use(wrap(resolveIdentity));
  }

  private registerRoutes(): void {
    const controller = this.taskController;

    this.router.get(restSettings.paths.allSuspendedTasks, wrap(controller.getAllSuspendedTasks.bind(controller)));
    this.router.get(restSettings.paths.processModelTasks, wrap(controller.getTasksForProcessModel.bind(controller)));
    this.router.get(restSettings.paths.processInstanceTasks, wrap(controller.getTasksForProcessInstance.bind(controller)));
    this.router.get(restSettings.paths.correlationTasks, wrap(controller.getTasksForCorrelation.bind(controller)));
    this.router.get(restSettings.paths.processModelCorrelationTasks, wrap(controller.getTasksForProcessModelInCorrelation.bind(controller)));
  }

}
