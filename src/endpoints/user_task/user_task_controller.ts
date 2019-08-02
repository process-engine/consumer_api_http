import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';

import {APIs, HttpController} from '@process-engine/consumer_api_contracts';

import {Response} from 'express';

export class UserTaskController implements HttpController.IUserTaskHttpController {

  private httpCodeSuccessfulResponse = 200;
  private httpCodeSuccessfulNoContentResponse = 204;

  private userTaskService: APIs.IUserTaskConsumerApi;

  constructor(userTaskService: APIs.IUserTaskConsumerApi) {
    this.userTaskService = userTaskService;
  }

  public async getUserTasksForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.userTaskService.getUserTasksForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;

    const result = await this.userTaskService.getUserTasksForProcessInstance(identity, processInstanceId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.userTaskService.getUserTasksForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.userTaskService.getUserTasksForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getWaitingUserTasksByIdentity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;

    const result = await this.userTaskService.getWaitingUserTasksByIdentity(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishUserTask(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;
    const processInstanceId = request.params.process_instance_id;
    const correlationId = request.params.correlation_id;
    const userTaskInstanceId = request.params.user_task_instance_id;
    const userTaskResult = request.body;

    await this.userTaskService.finishUserTask(identity, processInstanceId, correlationId, userTaskInstanceId, userTaskResult);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

}
