import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';

import {DataModels, IConsumerApi, IConsumerApiHttpController} from '@process-engine/consumer_api_contracts';

import {Response} from 'express';

export class ConsumerApiController implements IConsumerApiHttpController {

  private httpCodeSuccessfulResponse: number = 200;
  private httpCodeSuccessfulNoContentResponse: number = 204;

  private consumerApiService: IConsumerApi;

  constructor(consumerApiService: IConsumerApi) {
    this.consumerApiService = consumerApiService;
  }

  public async getProcessModels(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;

    const result = await this.consumerApiService.getProcessModels(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessModelById(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getProcessModelById(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessModelByProcessInstanceId(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getProcessModelByProcessInstanceId(identity, processInstanceId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const startEventId = request.query.start_event_id;
    const endEventId = request.query.end_event_id;
    const payload = request.body;

    let startCallbackType = <DataModels.ProcessModels.StartCallbackType> Number.parseInt(request.query.start_callback_type);

    if (!startCallbackType) {
      startCallbackType = DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated;
    }

    const identity = request.identity;

    const result = await this.consumerApiService.startProcessInstance(identity, processModelId, payload, startCallbackType, startEventId, endEventId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessResultForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getProcessResultForCorrelation(identity, correlationId, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessInstancesByIdentity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;

    const result = await this.consumerApiService.getProcessInstancesByIdentity(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  // event-routes
  public async getEventsForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getEventsForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getEventsForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getEventsForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async triggerMessageEvent(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const eventName = request.params.event_name;
    const payload = request.body;
    const identity = request.identity;

    await this.consumerApiService.triggerMessageEvent(identity, eventName, payload);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  public async triggerSignalEvent(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const eventName = request.params.event_name;
    const payload = request.body;
    const identity = request.identity;

    await this.consumerApiService.triggerSignalEvent(identity, eventName, payload);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // empty-activity-routes
  public async getEmptyActivitiesForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getEmptyActivitiesForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEmptyActivitiesForProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getEmptyActivitiesForProcessInstance(identity, processInstanceId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEmptyActivitiesForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getEmptyActivitiesForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEmptyActivitiesForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getEmptyActivitiesForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getWaitingEmptyActivitiesByIdentity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;

    const result = await this.consumerApiService.getWaitingEmptyActivitiesByIdentity(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishEmptyActivity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;
    const processInstanceId = request.params.process_instance_id;
    const correlationId = request.params.correlation_id;
    const emptyActivityInstanceId = request.params.empty_activity_instance_id;

    await this.consumerApiService.finishEmptyActivity(identity, processInstanceId, correlationId, emptyActivityInstanceId);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // user-task-routes
  public async getUserTasksForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getUserTasksForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getUserTasksForProcessInstance(identity, processInstanceId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getUserTasksForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getUserTasksForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getWaitingUserTasksByIdentity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;

    const result = await this.consumerApiService.getWaitingUserTasksByIdentity(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishUserTask(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;
    const processInstanceId = request.params.process_instance_id;
    const correlationId = request.params.correlation_id;
    const userTaskInstanceId = request.params.user_task_instance_id;
    const userTaskResult = request.body;

    await this.consumerApiService.finishUserTask(identity, processInstanceId, correlationId, userTaskInstanceId, userTaskResult);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // manual-task-routes
  public async getManualTasksForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getManualTasksForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getManualTasksForProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getManualTasksForProcessInstance(identity, processInstanceId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getManualTasksForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getManualTasksForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getManualTasksForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;

    const result = await this.consumerApiService.getManualTasksForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getWaitingManualTasksByIdentity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;

    const result = await this.consumerApiService.getWaitingManualTasksByIdentity(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishManualTask(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;
    const processInstanceId = request.params.process_instance_id;
    const manualTaskInstanceId = request.params.manual_task_instance_id;

    await this.consumerApiService.finishManualTask(identity, processInstanceId, correlationId, manualTaskInstanceId);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

}
