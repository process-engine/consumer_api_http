import {
  ConsumerContext,
  ConsumerRequest,
  EventList,
  EventTriggerPayload,
  IConsumerApiService,
  ICorrelationResult,
  ProcessModel,
  ProcessModelList,
  ProcessStartRequestPayload,
  ProcessStartResponsePayload,
  StartCallbackType,
  UserTaskList,
  UserTaskResult,
} from '@process-engine/consumer_api_contracts';

import {ExecutionContext, IIamService} from '@essential-projects/core_contracts';
import * as Errors from '@essential-projects/errors_ts';

import {Request, Response} from 'express';

export class ConsumerApiController {
  public config: any = undefined;

  private httpCodeSuccessfulResponse: number = 200;
  private httpCodeSuccessfulNoContentResponse: number = 204;

  private _consumerApiService: IConsumerApiService;
  private _iamService: IIamService;

  constructor(consumerApiService: IConsumerApiService, iamService: IIamService) {
    this._consumerApiService = consumerApiService;
    this._iamService = iamService;
  }

  private get consumerApiService(): IConsumerApiService {
    return this._consumerApiService;
  }

  private get iamService(): IIamService {
    return this._iamService;
  }

  public async getProcessModels(request: ConsumerRequest, response: Response): Promise<void> {
    const context: ConsumerContext = request.consumerContext;

    const result: ProcessModelList = await this.consumerApiService.getProcessModels(context);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessModelByKey(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const context: ConsumerContext = request.consumerContext;

    const result: ProcessModel = await this.consumerApiService.getProcessModelByKey(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcessInstance(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const startEventKey: string = request.params.start_event_key;
    const payload: ProcessStartRequestPayload = request.body;
    let startCallbackType: StartCallbackType = <StartCallbackType> Number.parseInt(request.query.start_callback_type);

    if (!startCallbackType) {
      startCallbackType = StartCallbackType.CallbackOnProcessInstanceCreated;
    }

    const context: ConsumerContext = request.consumerContext;

    const result: ProcessStartResponsePayload =
      await this.consumerApiService.startProcessInstance(context, processModelKey, startEventKey, payload, startCallbackType);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcessInstanceAndAwaitEndEvent(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const startEventKey: string = request.params.start_event_key;
    const endEventKey: string = request.params.end_event_key;
    const payload: ProcessStartRequestPayload = request.body;
    const context: ConsumerContext = request.consumerContext;

    const result: ProcessStartResponsePayload =
      await this.consumerApiService.startProcessInstanceAndAwaitEndEvent(context, processModelKey, startEventKey, endEventKey, payload);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessResultForCorrelation(request: ConsumerRequest, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;
    const processModelKey: string = request.params.process_model_key;
    const context: ConsumerContext = request.consumerContext;

    const result: ICorrelationResult = await this.consumerApiService.getProcessResultForCorrelation(context, correlationId, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  // event-routes
  public async getEventsForProcessModel(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const context: ConsumerContext = request.consumerContext;

    const result: EventList = await this.consumerApiService.getEventsForProcessModel(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForCorrelation(request: ConsumerRequest, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;
    const context: ConsumerContext = request.consumerContext;

    const result: EventList = await this.consumerApiService.getEventsForCorrelation(context, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForProcessModelInCorrelation(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const context: ConsumerContext = request.consumerContext;

    const result: EventList = await this.consumerApiService.getEventsForProcessModelInCorrelation(context, processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async triggerEvent(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const eventId: string = request.params.event_id;
    const eventTriggerPayload: EventTriggerPayload = request.body;
    const context: ConsumerContext = request.consumerContext;

    await this.consumerApiService.triggerEvent(context, processModelKey, correlationId, eventId, eventTriggerPayload);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // user-task-routes
  public async getUserTasksForProcessModel(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const context: ConsumerContext = request.consumerContext;

    const result: UserTaskList = await this.consumerApiService.getUserTasksForProcessModel(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForCorrelation(request: ConsumerRequest, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;
    const context: ConsumerContext = request.consumerContext;

    const result: UserTaskList = await this.consumerApiService.getUserTasksForCorrelation(context, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessModelInCorrelation(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const context: ConsumerContext = request.consumerContext;

    const result: UserTaskList = await this.consumerApiService.getUserTasksForProcessModelInCorrelation(context, processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishUserTask(request: ConsumerRequest, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const userTaskId: string = request.params.user_task_id;
    const userTaskResult: UserTaskResult = request.body;
    const context: ConsumerContext = request.consumerContext;

    await this.consumerApiService.finishUserTask(context, processModelKey, correlationId, userTaskId, userTaskResult);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }
}
