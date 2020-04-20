import {BadRequestError} from '@essential-projects/errors_ts';
import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';

import {APIs, HttpController} from '@process-engine/consumer_api_contracts';

import {Response} from 'express';

export class FlowNodeInstanceController implements HttpController.IFlowNodeInstanceHttpController {

  private httpCodeSuccessfulResponse = 200;
  private httpCodeSuccessfulNoContentResponse = 204;

  private flowNodenstanceService: APIs.IFlowNodeInstanceConsumerApi;

  constructor(flowNodenstanceService: APIs.IFlowNodeInstanceConsumerApi) {
    this.flowNodenstanceService = flowNodenstanceService;
  }

  public async getAllSuspendedTasks(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.flowNodenstanceService.getAllSuspendedTasks(
      identity,
      offset,
      limit,
    );

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getSuspendedTasksForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.flowNodenstanceService.getSuspendedTasksForProcessModel(
      identity,
      processModelId,
      offset,
      limit,
    );

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getSuspendedTasksForProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.flowNodenstanceService.getSuspendedTasksForProcessInstance(
      identity,
      processInstanceId,
      offset,
      limit,
    );

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getSuspendedTasksForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.flowNodenstanceService.getSuspendedTasksForCorrelation(
      identity,
      correlationId,
      offset,
      limit,
    );

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getSuspendedTasksForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.flowNodenstanceService.getSuspendedTasksForProcessModelInCorrelation(
      identity,
      processModelId,
      correlationId,
      offset,
      limit,
    );

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  private parseOffset(request: HttpRequestWithIdentity): number {
    try {
      return request.query?.offset ? parseInt(request.query.offset as string) : 0;
    } catch (error) {
      throw new BadRequestError(`Value ${request.query.offset} is not a valid offset! Offsets must be provided as a number.`);
    }
  }

  private parseLimit(request: HttpRequestWithIdentity): number {
    try {
      return request.query?.limit ? parseInt(request.query.limit as string) : 0;
    } catch (error) {
      throw new BadRequestError(`Value ${request.query.limit} is not a valid limit! Limits must be provided as a number.`);
    }
  }

}
