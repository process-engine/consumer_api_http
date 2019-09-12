import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';

import {APIs, HttpController} from '@process-engine/consumer_api_contracts';

import {Response} from 'express';

export class TaskController implements HttpController.ITaskHttpController {

  private httpCodeSuccessfulResponse = 200;
  private httpCodeSuccessfulNoContentResponse = 204;

  private taskService: APIs.ITaskConsumerApi;

  constructor(taskService: APIs.ITaskConsumerApi) {
    this.taskService = taskService;
  }

  public async getAllSuspendedTasks(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;

    const result = await this.taskService.getAllSuspendedTasks(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getTasksForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.taskService.getTasksForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getTasksForProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;

    const result = await this.taskService.getTasksForProcessInstance(identity, processInstanceId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getTasksForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.taskService.getTasksForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getTasksForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.taskService.getTasksForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

}
