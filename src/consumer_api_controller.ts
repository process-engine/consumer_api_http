import {
  IConsumerApiController,
  IConsumerApiService,
  IConsumerContext,
  IEventList,
  IEventTriggerPayload,
  IProcessModel,
  IProcessModelList,
  IProcessStartRequestPayload,
  IProcessStartResponsePayload,
  IUserTaskList,
  IUserTaskResult,
  ProcessStartReturnOnOptions,
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
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IProcessModelList = await this.consumerApiService.getProcessModels(context);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessModelByKey(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IProcessModel = await this.consumerApiService.getProcessModelByKey(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcess(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const startEventKey: string = request.params.start_event_key;
    const payload: IProcessStartRequestPayload = request.body;
    let returnOn: ProcessStartReturnOnOptions = request.query.return_on;

    if (!returnOn) {
      returnOn = ProcessStartReturnOnOptions.onProcessInstanceStarted;
    }

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IProcessStartResponsePayload =
      await this.consumerApiService.startProcess(context, processModelKey, startEventKey, payload, returnOn);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcessAndAwaitEndEvent(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const startEventKey: string = request.params.start_event_key;
    const endEventKey: string = request.params.end_event_key;
    const payload: IProcessStartRequestPayload = request.body;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IProcessStartResponsePayload =
      await this.consumerApiService.startProcessAndAwaitEndEvent(context, processModelKey, startEventKey, endEventKey, payload);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  // event-routes
  public async getEventsForProcessModel(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IEventList = await this.consumerApiService.getEventsForProcessModel(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForCorrelation(request: Request, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IEventList = await this.consumerApiService.getEventsForCorrelation(context, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForProcessModelInCorrelation(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IEventList = await this.consumerApiService.getEventsForProcessModelInCorrelation(context, processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async triggerEvent(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const eventId: string = request.params.event_id;
    const eventTriggerPayload: IEventTriggerPayload = request.body;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    await this.consumerApiService.triggerEvent(context, processModelKey, correlationId, eventId, eventTriggerPayload);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // user-task-routes
  public async getUserTasksForProcessModel(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IUserTaskList = await this.consumerApiService.getUserTasksForProcessModel(context, processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForCorrelation(request: Request, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IUserTaskList = await this.consumerApiService.getUserTasksForCorrelation(context, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessModelInCorrelation(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    const result: IUserTaskList = await this.consumerApiService.getUserTasksForProcessModelInCorrelation(context, processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishUserTask(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const userTaskId: string = request.params.event_id;
    const userTaskResult: IUserTaskResult = request.body;

    // TODO: Move to HTTP middleware in a custom http extension?
    const context: IConsumerContext = this.resolveCustomerContext(request);

    await this.consumerApiService.finishUserTask(context, processModelKey, correlationId, userTaskId, userTaskResult);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  private resolveCustomerContext(request: Request): IConsumerContext {
    try {
      const bearerToken: string = this.getHeaderValue(request, 'authorization');

      if (!bearerToken) {
        throw new Errors.UnauthorizedError('No auth token provided!');
      }

      // TODO: Maybe retrieve other header values?
      const consumerContext: IConsumerContext = {
        authorization: bearerToken,
        Internationalization: this.getHeaderValue(request, 'accept-language'),
      };

      return consumerContext;
    } catch (err) {
      throw new Errors.UnauthorizedError(err.message);
    }
  }

  private getHeaderValue(request: Request, headerName: string): string {

    const header: string = request.headers[headerName] as string;

    if (!header) {
      return;
    }

    const headerValueParts: Array<string> = header.split(' ');
    const headerValue: string = headerValueParts[1];

    return headerValue;
  }
}
