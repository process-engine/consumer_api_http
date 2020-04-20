import {BadRequestError} from '@essential-projects/errors_ts';
import {HttpRequestWithIdentity} from '@essential-projects/http_contracts';

import {APIs, HttpController} from '@process-engine/consumer_api_contracts';

import {Response} from 'express';

export class EmptyActivityController implements HttpController.IEmptyActivityHttpController {

  private httpCodeSuccessfulResponse = 200;
  private httpCodeSuccessfulNoContentResponse = 204;

  private emptyActivityService: APIs.IEmptyActivityConsumerApi;

  constructor(emptyActivityService: APIs.IEmptyActivityConsumerApi) {
    this.emptyActivityService = emptyActivityService;
  }

  public async getEmptyActivitiesForProcessModel(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.emptyActivityService.getEmptyActivitiesForProcessModel(identity, processModelId, offset, limit);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEmptyActivitiesForProcessInstance(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processInstanceId = request.params.process_instance_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.emptyActivityService.getEmptyActivitiesForProcessInstance(identity, processInstanceId, offset, limit);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEmptyActivitiesForCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const correlationId = request.params.correlation_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.emptyActivityService.getEmptyActivitiesForCorrelation(identity, correlationId, offset, limit);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getEmptyActivitiesForProcessModelInCorrelation(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const processModelId = request.params.process_model_id;
    const correlationId = request.params.correlation_id;
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result =
      await this.emptyActivityService.getEmptyActivitiesForProcessModelInCorrelation(identity, processModelId, correlationId, offset, limit);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async getWaitingEmptyActivitiesByIdentity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;
    const offset = this.parseOffset(request);
    const limit = this.parseLimit(request);

    const result = await this.emptyActivityService.getWaitingEmptyActivitiesByIdentity(identity, offset, limit);

    response.status(this.httpCodeSuccessfulResponse).json(result);
  }

  public async finishEmptyActivity(request: HttpRequestWithIdentity, response: Response): Promise<void> {
    const identity = request.identity;
    const processInstanceId = request.params.process_instance_id;
    const correlationId = request.params.correlation_id;
    const emptyActivityInstanceId = request.params.empty_activity_instance_id;

    await this.emptyActivityService.finishEmptyActivity(identity, processInstanceId, correlationId, emptyActivityInstanceId);

    response.status(this.httpCodeSuccessfulNoContentResponse).send();
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
