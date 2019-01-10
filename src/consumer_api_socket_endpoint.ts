import * as jsonwebtoken from 'jsonwebtoken';
import {Logger} from 'loggerhythm';

import {UnauthorizedError} from '@essential-projects/errors_ts';
import {IEventAggregator} from '@essential-projects/event_aggregator_contracts';
import {BaseSocketEndpoint} from '@essential-projects/http_node';
import {IIdentity, TokenBody} from '@essential-projects/iam_contracts';

import {IConsumerApi, Messages, socketSettings} from '@process-engine/consumer_api_contracts';

const logger: Logger = Logger.createLogger('consumer_api:http:socket.io_endpoint');

interface IConnection {
  userId: string;
  identity: IIdentity;
}

export class ConsumerApiSocketEndpoint extends BaseSocketEndpoint {

  private _connections: Map<string, IConnection> = new Map();
  private _consumerApiService: IConsumerApi;
  private _eventAggregator: IEventAggregator;

  constructor(consumerApiService: IConsumerApi, eventAggregator: IEventAggregator) {
    super();
    this._consumerApiService = consumerApiService;
    this._eventAggregator = eventAggregator;
  }

  public get namespace(): string {
    return socketSettings.namespace;
  }

  public initializeEndpoint(socketIo: SocketIO.Namespace): void {

    socketIo.on('connect', (socket: SocketIO.Socket) => {
      const token: string = socket.handshake.headers['authorization'];

      const identityNotSet: boolean = token === undefined;
      if (identityNotSet) {
        throw new UnauthorizedError('No auth token provided!');
      }

      const identity: IIdentity = {
        token: token,
      };

      const decodedIdentity: TokenBody = <TokenBody> jsonwebtoken.decode(identity.token);
      const userId: string = decodedIdentity.sub;

      const connection: IConnection = {
        identity: identity,
        userId: userId,
      };

      this._connections.set(socket.id, connection);

      logger.info(`Client with socket id "${socket.id} connected."`);

      socket.on('disconnect', (reason: any) => {
        this._connections.delete(socket.id);

        logger.info(`Client with socket id "${socket.id} disconnected."`);
      });

      // User specific notifications
      // We can just pass on the received message, because the ConsumerApiService
      // will already have ensured that the identites match.
      this._consumerApiService.onUserTaskForIdentityWaiting(connection.identity,
        (message: Messages.Internal.SystemEvents.UserTaskReachedMessage) => {

          const eventToPublish: string = socketSettings.paths.userTaskForIdentityWaiting
            .replace(socketSettings.pathParams.userId, connection.userId);

          socketIo.emit(eventToPublish, message);
        });

      this._consumerApiService.onUserTaskForIdentityFinished(connection.identity,
        (message: Messages.Internal.SystemEvents.UserTaskReachedMessage) => {

          const eventToPublish: string = socketSettings.paths.userTaskForIdentityFinished
            .replace(socketSettings.pathParams.userId, connection.userId);

          socketIo.emit(eventToPublish, message);
        });

      this._consumerApiService.onManualTaskForIdentityWaiting(connection.identity,
        (message: Messages.Internal.SystemEvents.UserTaskReachedMessage) => {

          const eventToPublish: string = socketSettings.paths.manualTaskForIdentityWaiting
            .replace(socketSettings.pathParams.userId, connection.userId);

          socketIo.emit(eventToPublish, message);
        });

      this._consumerApiService.onManualTaskForIdentityFinished(connection.identity,
        (message: Messages.Internal.SystemEvents.UserTaskReachedMessage) => {

          const eventToPublish: string = socketSettings.paths.manualTaskForIdentityFinished
            .replace(socketSettings.pathParams.userId, connection.userId);

          socketIo.emit(eventToPublish, message);
        });
    });

    // Global notifications
    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskReached,
      (userTaskWaitingMessage: Messages.Internal.SystemEvents.UserTaskReachedMessage) => {
        socketIo.emit(socketSettings.paths.userTaskWaiting, userTaskWaitingMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskFinished,
      (userTaskFinishedMessage: Messages.Internal.SystemEvents.UserTaskFinishedMessage) => {
        socketIo.emit(socketSettings.paths.userTaskFinished, userTaskFinishedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.manualTaskReached,
      (manualTaskWaitingMessage: Messages.Internal.SystemEvents.ManualTaskReachedMessage) => {
        socketIo.emit(socketSettings.paths.manualTaskWaiting, manualTaskWaitingMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.manualTaskFinished,
      (manualTaskFinishedMessage: Messages.Internal.SystemEvents.ManualTaskFinishedMessage) => {
        socketIo.emit(socketSettings.paths.manualTaskFinished, manualTaskFinishedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processStarted,
      (processStartedMessage: Messages.Internal.SystemEvents.ProcessStartedMessage) => {
        socketIo.emit(socketSettings.paths.processStarted, processStartedMessage);

        const processInstanceStartedIdMessage: string =
          socketSettings.paths.processInstanceStarted
            .replace(socketSettings.pathParams.processModelId, processStartedMessage.processModelId);

        socketIo.emit(processInstanceStartedIdMessage, processStartedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processEnded,
      (processEndedMessage: Messages.Internal.BpmnEvents.EndEventReachedMessage) => {
        socketIo.emit(socketSettings.paths.processEnded, processEndedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processTerminated,
      (processTerminatedMessage: Messages.Internal.BpmnEvents.TerminateEndEventReachedMessage) => {
        socketIo.emit(socketSettings.paths.processTerminated, processTerminatedMessage);
      });
  }
}
