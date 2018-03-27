import {
  ConsumerContext,
  EventList,
  EventTriggerPayload,
  IConsumerApiController,
  IConsumerApiService,
  ProcessModel,
  ProcessModelList,
  ProcessStartRequestPayload,
  ProcessStartResponsePayload,
  ProcessStartReturnOnOptions,
  UserTaskList,
  UserTaskResult,
} from '@process-engine/consumer_api_contracts';

import {ExecutionContext, IIamService} from '@essential-projects/core_contracts';
import * as Errors from '@essential-projects/errors_ts';

import {Request, Response} from 'express';

export class ConsumerApiController implements IConsumerApiController {
  public config: any = undefined;

  private httpCodeSuccessfulResponse: number = 200;
  private httpCodeSuccessfulNoContentResponse: number = 204;
  private httpCodeErrorUnauthorized: number = 401;
  private httpCodeErrorForbidden: number = 403;

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

  public async getProcessModels(request: Request, response: Response): Promise<void> {

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: ProcessModelList = await this.consumerApiService.getProcessModels(context);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessModelByKey(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: ProcessModel = await this.consumerApiService.getProcessModelByKey(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcess(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const startEventKey: string = request.params.start_event_key;
    const payload: ProcessStartRequestPayload = request.body;
    let returnOn: ProcessStartReturnOnOptions = request.query.return_on;

    if (!returnOn) {
      returnOn = ProcessStartReturnOnOptions.onProcessInstanceStarted;
    }

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: ProcessStartResponsePayload =
      await this.consumerApiService.startProcess(context, processModelKey, startEventKey, payload, returnOn);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcessAndAwaitEndEvent(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const startEventKey: string = request.params.start_event_key;
    const endEventKey: string = request.params.end_event_key;
    const payload: ProcessStartRequestPayload = request.body;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: ProcessStartResponsePayload =
      await this.consumerApiService.startProcessAndAwaitEndEvent(context, processModelKey, startEventKey, endEventKey, payload);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  // event-routes
  public async getEventsForProcessModel(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: EventList = await this.consumerApiService.getEventsForProcessModel(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForCorrelation(request: Request, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: EventList = await this.consumerApiService.getEventsForCorrelation(context, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForProcessModelInCorrelation(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: EventList = await this.consumerApiService.getEventsForProcessModelInCorrelation(context, processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async triggerEvent(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const eventId: string = request.params.event_id;
    const eventTriggerPayload: EventTriggerPayload = request.body;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    await this.consumerApiService.triggerEvent(context, processModelKey, correlationId, eventId, eventTriggerPayload);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // user-task-routes
  public async getUserTasksForProcessModel(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: UserTaskList = await this.consumerApiService.getUserTasksForProcessModel(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForCorrelation(request: Request, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: UserTaskList = await this.consumerApiService.getUserTasksForCorrelation(context, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessModelInCorrelation(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    const result: UserTaskList = await this.consumerApiService.getUserTasksForProcessModelInCorrelation(context, processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishUserTask(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const userTaskId: string = request.params.user_task_id;
    const userTaskResult: UserTaskResult = request.body;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: ConsumerContext = this.resolveCustomerContext(request);

    await this.consumerApiService.finishUserTask(context, processModelKey, correlationId, userTaskId, userTaskResult);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  private resolveCustomerContext(request: Request): ConsumerContext {
    const bearerToken: string = request.get('authorization');

    if (!bearerToken) {
      throw new Errors.UnauthorizedError('No auth token provided!');
    }

    // TODO: Maybe retrieve other header values?
    const consumerContext: ConsumerContext = {
      identity: bearerToken.substr('Bearer '.length),
      Internationalization: request.get('accept-language'),
    };

    return consumerContext;
  }
}
