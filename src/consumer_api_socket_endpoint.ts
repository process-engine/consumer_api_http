import {Logger} from 'loggerhythm';

import {IEventAggregator} from '@essential-projects/event_aggregator_contracts';
import {BaseSocketEndpoint} from '@essential-projects/http_node';

import {Messages, socketSettings} from '@process-engine/consumer_api_contracts';

const logger: Logger = Logger.createLogger('consumer_api:http:socket.io_endpoint');

interface IConnection {
  identity: string;
}

export class ConsumerApiSocketEndpoint extends BaseSocketEndpoint {

  private _eventAggregator: IEventAggregator;
  private _connections: Map<string, IConnection> = new Map();

  constructor(eventAggregator: IEventAggregator) {
    super();
    this._eventAggregator = eventAggregator;
  }

  private get eventAggregator(): IEventAggregator {
    return this._eventAggregator;
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

      this._connections.set(socket.id, connection);

      logger.info(`Client with socket id "${socket.id} connected."`);

      socket.on('disconnect', (reason: any) => {
        this._connections.delete(socket.id);

        logger.info(`Client with socket id "${socket.id} disconnected."`);
      });
    });

    this.eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskReached,
      (userTaskWaitingMessage: Messages.SystemEvents.UserTaskReachedMessage) => {
        socketIo.emit(socketSettings.paths.userTaskWaiting, userTaskWaitingMessage);
      });

    this.eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskFinished,
      (userTaskFinishedMessage: Messages.SystemEvents.UserTaskFinishedMessage) => {
        socketIo.emit(socketSettings.paths.userTaskFinished, userTaskFinishedMessage);
      });

    this.eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processEnded,
      (processEndedMessage: Messages.SystemEvents.ProcessEndedMessage) => {
        socketIo.emit(socketSettings.paths.processEnded, processEndedMessage);
      });

    this.eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processTerminated,
      (processTerminatedMessage: Messages.SystemEvents.ProcessEndedMessage) => {
        socketIo.emit(socketSettings.paths.processTerminated, processTerminatedMessage);
      });
  }

}
