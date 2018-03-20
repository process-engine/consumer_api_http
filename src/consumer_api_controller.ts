import {
  IConsumerApiController,
  IConsumerApiService,
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
    const result: IProcessModelList = await this.consumerApiService.getProcessModels();

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getProcessModelByKey(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const result: IProcessModel = await this.consumerApiService.getProcessModelByKey(processModelKey);

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

    // TODO: This is probably a better job for a HTTP Extension.
    const context: ExecutionContext = await this.resolveExecutionContext(request);

    const result: IProcessStartResponsePayload =
      await this.consumerApiService.startProcess(context, processModelKey, startEventKey, payload, returnOn);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async startProcessAndAwaitEndEvent(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const startEventKey: string = request.params.start_event_key;
    const endEventKey: string = request.params.end_event_key;
    const payload: IProcessStartRequestPayload = request.body;

    // TODO: This is probably a better job for a HTTP Extension.
    const context: ExecutionContext = await this.resolveExecutionContext(request);

    const result: IProcessStartResponsePayload =
      await this.consumerApiService.startProcessAndAwaitEndEvent(context, processModelKey, startEventKey, endEventKey, payload);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  // event-routes
  public async getEventsForProcessModel(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    const result: IEventList = await this.consumerApiService.getEventsForProcessModel(processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForCorrelation(request: Request, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;

    const result: IEventList = await this.consumerApiService.getEventsForCorrelation(correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEventsForProcessModelInCorrelation(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;

    const result: IEventList = await this.consumerApiService.getEventsForProcessModelInCorrelation(processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async triggerEvent(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const eventId: string = request.params.event_id;
    const eventTriggerPayload: IEventTriggerPayload = request.body;

    await this.consumerApiService.triggerEvent(processModelKey, correlationId, eventId, eventTriggerPayload);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  // user-task-routes
  public async getUserTasksForProcessModel(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;

    const result: IUserTaskList = await this.consumerApiService.getUserTasksForProcessModel(processModelKey);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForCorrelation(request: Request, response: Response): Promise<void> {
    const correlationId: string = request.params.correlation_id;

    const result: IUserTaskList = await this.consumerApiService.getUserTasksForCorrelation(correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getUserTasksForProcessModelInCorrelation(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;

    const result: IUserTaskList = await this.consumerApiService.getUserTasksForProcessModelInCorrelation(processModelKey, correlationId);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishUserTask(request: Request, response: Response): Promise<void> {
    const processModelKey: string = request.params.process_model_key;
    const correlationId: string = request.params.correlation_id;
    const userTaskId: string = request.params.event_id;
    const userTaskResult: IUserTaskResult = request.body;

    await this.consumerApiService.finishUserTask(processModelKey, correlationId, userTaskId, userTaskResult);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
  }

  private async resolveExecutionContext(request: Request): Promise<ExecutionContext> {
    try {
      let bearerToken: string;
      const authorizationHeader: string = request.headers.authorization as string;

      // first try auth header
      if (typeof authorizationHeader !== 'string') {
        throw new Errors.UnauthorizedError('No auth token provided!');
      }

      const authorizationHeaderValues: Array<string> = authorizationHeader.split(' ');
      bearerToken = authorizationHeaderValues[1];

      return this.iamService.resolveExecutionContext(bearerToken);
    } catch (err) {
      throw new Errors.UnauthorizedError(err.message);
    }
  }
}
