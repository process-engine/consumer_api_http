import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';
import {IIdentity} from '@essential-projects/iam_contracts';

import {
  CorrelationResult,
  EventList,
  EventTriggerPayload,
  IConsumerApi,
  ProcessModel,
  ProcessModelList,
  ProcessStartRequestPayload,
  ProcessStartResponsePayload,
  StartCallbackType,
  UserTaskList,
  UserTaskResult,
} from '@process-engine/consumer_api_contracts';

import {Response} from 'express';

export class ConsumerApiController {
  public config: any = undefined;

  private httpCodeSuccessfulResponse: number = 200;
  private httpCodeSuccessfulNoContentResponse: number = 204;

  private consumerApiService: IConsumerApi;

  constructor(consumerApiService: IConsumerApi) {
    this.consumerApiService = consumerApiService;
  }

  public async getProcessModels(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity: IIdentity = request.identity;

    const result: ProcessModelList = await this.consumerApiService.getProcessModels(identity);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessModelById(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const identity: IIdentity = request.identity;

    const result: ProcessModel = await this.consumerApiService.getProcessModelById(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const startEventId: string = request.params.start_event_id;
    const endEventId: string = request.query.end_event_id;
    const payload: ProcessStartRequestPayload = request.body;
    let startCallbackType: StartCallbackType = <StartCallbackType> Number.parseInt(request.query.start_callback_type);

    if (!startCallbackType) {
      startCallbackType = StartCallbackType.CallbackOnProcessInstanceCreated;
    }

    const identity: IIdentity = request.identity;

    const result: ProcessStartResponsePayload =
      await this.consumerApiService.startProcessInstance(identity, processModelId, startEventId, payload, startCallbackType, endEventId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessResultForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;
    const processModelId: string = request.params.process_model_id;
    const identity: IIdentity = request.identity;

    const result: Array<CorrelationResult> = await this.consumerApiService.getProcessResultForCorrelation(identity, correlationId, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  // event-routes
  public async getEventsForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const identity: IIdentity = request.identity;

    const result: EventList = await this.consumerApiService.getEventsForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;
    const identity: IIdentity = request.identity;

    const result: EventList = await this.consumerApiService.getEventsForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const correlationId: string = request.params.correlation_id;
    const identity: IIdentity = request.identity;

    const result: EventList = await this.consumerApiService.getEventsForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async triggerEvent(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const correlationId: string = request.params.correlation_id;
    const eventId: string = request.params.event_id;
    const eventTriggerPayload: EventTriggerPayload = request.body;
    const identity: IIdentity = request.identity;

    await this.consumerApiService.triggerEvent(identity, processModelId, correlationId, eventId, eventTriggerPayload);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // user-task-routes
  public async getUserTasksForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const identity: IIdentity = request.identity;

    const result: UserTaskList = await this.consumerApiService.getUserTasksForProcessModel(identity, processModelId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;
    const identity: IIdentity = request.identity;

    const result: UserTaskList = await this.consumerApiService.getUserTasksForCorrelation(identity, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const correlationId: string = request.params.correlation_id;
    const identity: IIdentity = request.identity;

    const result: UserTaskList = await this.consumerApiService.getUserTasksForProcessModelInCorrelation(identity, processModelId, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishUserTask(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId: string = request.params.process_model_id;
    const correlationId: string = request.params.correlation_id;
    const userTaskId: string = request.params.user_task_id;
    const userTaskResult: UserTaskResult = request.body;
    const identity: IIdentity = request.identity;

    await this.consumerApiService.finishUserTask(identity, processModelId, correlationId, userTaskId, userTaskResult);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }
}
