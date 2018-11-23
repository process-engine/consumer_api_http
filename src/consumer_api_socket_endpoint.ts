import {Logger} from 'loggerhythm';

import {UnauthorizedError} from '@essential-projects/errors_ts';
import {IEventAggregator} from '@essential-projects/event_aggregator_contracts';
import {BaseSocketEndpoint} from '@essential-projects/http_node';

import {Messages, socketSettings} from '@process-engine/consumer_api_contracts';

const logger: Logger = Logger.createLogger('consumer_api:http:socket.io_endpoint');

interface IConnection {
  identity: string;
}

export class ConsumerApiSocketEndpoint extends BaseSocketEndpoint {

  private _connections: Map<string, IConnection> = new Map();
  private _eventAggregator: IEventAggregator;

  constructor(eventAggregator: IEventAggregator) {
    super();
    this._eventAggregator = eventAggregator;
  }

  public get namespace(): string {
    return socketSettings.namespace;
  }

  public initializeEndpoint(socketIo: SocketIO.Namespace): void {

    socketIo.on('connect', (socket: SocketIO.Socket) => {
      const identity: string = socket.handshake.headers['authorization'];

      const connection: IConnection = {
        identity: identity,
      };

      const identityNotSet: boolean = identity === undefined;
      if (identityNotSet) {
        throw new UnauthorizedError('No auth token provided!');
      }

      this._connections.set(socket.id, connection);

      logger.info(`Client with socket id "${socket.id} connected."`);

      socket.on('disconnect', (reason: any) => {
        this._connections.delete(socket.id);

        logger.info(`Client with socket id "${socket.id} disconnected."`);
      });
    });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskReached,
      (userTaskWaitingMessage: Messages.SystemEvents.UserTaskReachedMessage) => {
        socketIo.emit(socketSettings.paths.userTaskWaiting, userTaskWaitingMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskFinished,
      (userTaskFinishedMessage: Messages.SystemEvents.UserTaskFinishedMessage) => {
        socketIo.emit(socketSettings.paths.userTaskFinished, userTaskFinishedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.manualTaskReached,
      (manualTaskWaitingMessage: Messages.SystemEvents.ManualTaskReachedMessage) => {
        socketIo.emit(socketSettings.paths.manualTaskWaiting, manualTaskWaitingMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.manualTaskFinished,
      (manualTaskFinishedMessage: Messages.SystemEvents.ManualTaskFinishedMessage) => {
        socketIo.emit(socketSettings.paths.manualTaskFinished, manualTaskFinishedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processStarted,
      (processStartedMessage: Messages.SystemEvents.ProcessStartedMessage) => {
        socketIo.emit(socketSettings.paths.processStarted, processStartedMessage);

        const processInstanceStartedIdMessage: string =
          socketSettings.paths.processInstanceStarted
            .replace(socketSettings.pathParams.processModelId, processStartedMessage.processModelId);

        socketIo.emit(processInstanceStartedIdMessage, processStartedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processEnded,
      (processEndedMessage: Messages.SystemEvents.ProcessEndedMessage) => {
        socketIo.emit(socketSettings.paths.processEnded, processEndedMessage);
      });

    this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processTerminated,
      (processTerminatedMessage: Messages.SystemEvents.ProcessEndedMessage) => {
        socketIo.emit(socketSettings.paths.processTerminated, processTerminatedMessage);
      });
  }
}
