import {Logger} from 'loggerhythm';

import {UnauthorizedError} from '@essential-projects/errors_ts';
import {IEventAggregator, Subscription} from '@essential-projects/event_aggregator_contracts';
import {BaseSocketEndpoint} from '@essential-projects/http_node';
import {IIdentity, IIdentityService} from '@essential-projects/iam_contracts';

import {IConsumerApi, Messages, socketSettings} from '@process-engine/consumer_api_contracts';

const logger: Logger = Logger.createLogger('consumer_api:http:socket.io_endpoint');

type UserSubscriptionDictionary = {[userId: string]: Array<Subscription>};

export class ConsumerApiSocketEndpoint extends BaseSocketEndpoint {

  private _connections: Map<string, IIdentity> = new Map();

  private _consumerApiService: IConsumerApi;
  private _eventAggregator: IEventAggregator;
  private _identityService: IIdentityService;

  private _endpointSubscriptions: Array<Subscription> = [];
  private _userSubscriptions: UserSubscriptionDictionary = {};

  constructor(consumerApiService: IConsumerApi, eventAggregator: IEventAggregator, identityService: IIdentityService) {
    super();
    this._consumerApiService = consumerApiService;
    this._eventAggregator = eventAggregator;
    this._identityService = identityService;
  }

  public get namespace(): string {
    return socketSettings.namespace;
  }

  public async initializeEndpoint(socketIo: SocketIO.Namespace): Promise<void> {

    socketIo.on('connect', async(socket: SocketIO.Socket) => {
      const token: string = socket.handshake.headers['authorization'];

      const identityNotSet: boolean = token === undefined;
      if (identityNotSet) {
        throw new UnauthorizedError('No auth token provided!');
      }

      const identity: IIdentity = await this._identityService.getIdentity(token);

      this._connections.set(socket.id, identity);

      logger.info(`Client with socket id "${socket.id} connected."`);

      socket.on('disconnect', async(reason: any) => {
        this._connections.delete(socket.id);

        await this._clearUserScopeNotifications(identity);

        logger.info(`Client with socket id "${socket.id} disconnected."`);
      });

      await this._createUserScopeNotifications(socket, identity);
    });

    await this._createSocketScopeNotifications(socketIo);
  }

  public async dispose(): Promise<void> {

    logger.info(`Disposing Socket IO subscriptions...`);
    // Clear out Socket-scope Subscriptions.
    for (const subscription of this._endpointSubscriptions) {
      this._eventAggregator.unsubscribe(subscription);
    }

    // Clear out all User-Subscriptions.
    for (const userId in this._userSubscriptions) {
      const userSubscriptions: Array<Subscription> = this._userSubscriptions[userId];

      for (const subscription of userSubscriptions) {
        this._eventAggregator.unsubscribe(subscription);
      }

      delete this._userSubscriptions[userId];
    }
  }

  /**
   * Creates a number of Subscriptions for globally published events.
   * These events will be published for every user connected to the socketIO
   * instance.
   *
   * @async
   * @param socketIoInstance The socketIO instance for which to create the
   *                         subscriptions.
   */
  private async _createSocketScopeNotifications(socketIoInstance: SocketIO.Namespace): Promise<void> {

    const userTaskReachedSubscription: Subscription =
      this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskReached,
        (userTaskWaitingMessage: Messages.Public.SystemEvents.UserTaskReachedMessage) => {
          socketIoInstance.emit(socketSettings.paths.userTaskWaiting, userTaskWaitingMessage);
        });

    const userTaskFinishedSubscription: Subscription =
      this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.userTaskFinished,
        (userTaskFinishedMessage: Messages.Public.SystemEvents.UserTaskFinishedMessage) => {
          socketIoInstance.emit(socketSettings.paths.userTaskFinished, userTaskFinishedMessage);
        });

    const manualTaskReachedSubscription: Subscription =
      this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.manualTaskReached,
        (manualTaskWaitingMessage: Messages.Public.SystemEvents.ManualTaskReachedMessage) => {
          socketIoInstance.emit(socketSettings.paths.manualTaskWaiting, manualTaskWaitingMessage);
        });

    const manualTaskFinishedSubscription: Subscription =
      this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.manualTaskFinished,
        (manualTaskFinishedMessage: Messages.Public.SystemEvents.ManualTaskFinishedMessage) => {
          socketIoInstance.emit(socketSettings.paths.manualTaskFinished, manualTaskFinishedMessage);
        });

    const processStartedSubscription: Subscription =
      this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processStarted,
        (processStartedMessage: Messages.Public.SystemEvents.ProcessStartedMessage) => {
          socketIoInstance.emit(socketSettings.paths.processStarted, processStartedMessage);

          const processInstanceStartedIdMessage: string =
            socketSettings.paths.processInstanceStarted
              .replace(socketSettings.pathParams.processModelId, processStartedMessage.processModelId);

          socketIoInstance.emit(processInstanceStartedIdMessage, processStartedMessage);
        });

    const processEndedSubscription: Subscription =
      this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processEnded,
        (processEndedMessage: Messages.Public.BpmnEvents.EndEventReachedMessage) => {
          socketIoInstance.emit(socketSettings.paths.processEnded, processEndedMessage);
        });

    const processTerminatedSubscription: Subscription =
      this._eventAggregator.subscribe(Messages.EventAggregatorSettings.messagePaths.processTerminated,
        (processTerminatedMessage: Messages.Public.BpmnEvents.TerminateEndEventReachedMessage) => {
          socketIoInstance.emit(socketSettings.paths.processTerminated, processTerminatedMessage);
        });

    this._endpointSubscriptions.push(userTaskReachedSubscription);
    this._endpointSubscriptions.push(userTaskFinishedSubscription);
    this._endpointSubscriptions.push(manualTaskReachedSubscription);
    this._endpointSubscriptions.push(manualTaskFinishedSubscription);
    this._endpointSubscriptions.push(processStartedSubscription);
    this._endpointSubscriptions.push(processEndedSubscription);
    this._endpointSubscriptions.push(processTerminatedSubscription);
  }

  /**
   * Creates a number of Subscriptions for events that are only published for
   * certain identities.
   * An example would be "UserTask started by User with ID 123456".
   *
   * @async
   * @param socket   The socketIO client on which to create the subscriptions.
   * @param identity The identity for which to create the subscriptions
   */
  private async _createUserScopeNotifications(socket: SocketIO.Socket, identity: IIdentity): Promise<void> {

    const userSubscriptions: Array<Subscription> = [];

    const onUserTaskForIdentityWaitingSubscription: Subscription =
      await this._consumerApiService.onUserTaskForIdentityWaiting(identity,
        (message: Messages.Public.SystemEvents.UserTaskReachedMessage) => {

          const eventToPublish: string = socketSettings.paths.userTaskForIdentityWaiting
            .replace(socketSettings.pathParams.userId, identity.userId);

          socket.emit(eventToPublish, message);
        });

    const onUserTaskForIdentityFinishedSubscription: Subscription =
      await this._consumerApiService.onUserTaskForIdentityFinished(identity,
        (message: Messages.Public.SystemEvents.UserTaskReachedMessage) => {

          const eventToPublish: string = socketSettings.paths.userTaskForIdentityFinished
            .replace(socketSettings.pathParams.userId, identity.userId);

          socket.emit(eventToPublish, message);
        });

    const onManualTaskForIdentityWaitingSubscription: Subscription =
      await this._consumerApiService.onManualTaskForIdentityWaiting(identity,
        (message: Messages.Public.SystemEvents.UserTaskReachedMessage) => {

          const eventToPublish: string = socketSettings.paths.manualTaskForIdentityWaiting
            .replace(socketSettings.pathParams.userId, identity.userId);

          socket.emit(eventToPublish, message);
        });

    const onManualTaskForIdentityFinishedSubscription: Subscription =
      await this._consumerApiService.onManualTaskForIdentityFinished(identity,
      (message: Messages.Public.SystemEvents.UserTaskReachedMessage) => {

        const eventToPublish: string = socketSettings.paths.manualTaskForIdentityFinished
          .replace(socketSettings.pathParams.userId, identity.userId);

        socket.emit(eventToPublish, message);
      });

    userSubscriptions.push(onUserTaskForIdentityWaitingSubscription);
    userSubscriptions.push(onUserTaskForIdentityFinishedSubscription);
    userSubscriptions.push(onManualTaskForIdentityWaitingSubscription);
    userSubscriptions.push(onManualTaskForIdentityFinishedSubscription);

    this._userSubscriptions[identity.userId] = userSubscriptions;
  }

  /**
   * Clears out all Subscriptions for the given identity.
   * Should only be used when a client disconnects.
   *
   * @async
   * @param identity The identity for which to remove the Subscriptions.
   */
  private async _clearUserScopeNotifications(identity: IIdentity): Promise<void> {

    logger.verbose(`Clearing subscriptions for user with ID ${identity.userId}`);
    const userSubscriptions: Array<Subscription> = this._userSubscriptions[identity.userId];

    const noSubscriptionsFound: boolean = !userSubscriptions;
    if (noSubscriptionsFound) {
      logger.verbose(`No subscriptions for user with ID ${identity.userId} found.`);

      return;
    }

    for (const subscription of userSubscriptions) {
      await this._consumerApiService.removeSubscription(identity, subscription);
    }

    delete this._userSubscriptions[identity.userId];
  }
}
