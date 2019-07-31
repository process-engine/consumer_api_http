'use strict'

const EmptyActivityEndpoint = require('./dist/commonjs/index').Endpoints.EmptyActivity;
const EventEndpoint = require('./dist/commonjs/index').Endpoints.Event;
const ManualTaskEndpoint = require('./dist/commonjs/index').Endpoints.ManualTask;
const NotificationEndpoint = require('./dist/commonjs/index').Endpoints.Notification;
const ProcessModelEndpoint = require('./dist/commonjs/index').Endpoints.ProcessModel;
const UserTaskEndpoint = require('./dist/commonjs/index').Endpoints.UserTask;

const routerDiscoveryTag = require('@essential-projects/bootstrapper_contracts').routerDiscoveryTag;
const socketEndpointDiscoveryTag = require('@essential-projects/bootstrapper_contracts').socketEndpointDiscoveryTag;

function registerInContainer(container) {
  registerHttpEndpoints(container);
  registerSocketEndpoints(container);
}

function registerHttpEndpoints(container) {

  container.register('ConsumerApiEmptyActivityRouter', EmptyActivityEndpoint.EmptyActivityRouter)
    .dependencies('ConsumerApiEmptyActivityController', 'IdentityService')
    .singleton()
    .tags(routerDiscoveryTag);

  container.register('ConsumerApiEmptyActivityController', EmptyActivityEndpoint.EmptyActivityController)
    .dependencies('ConsumerApiEmptyActivityService')
    .singleton();

  container.register('ConsumerApiEventRouter', EventEndpoint.EventRouter)
    .dependencies('ConsumerApiEventController', 'IdentityService')
    .singleton()
    .tags(routerDiscoveryTag);

  container.register('ConsumerApiEventController', EventEndpoint.EventController)
    .dependencies('ConsumerApiEventService')
    .singleton();

  container.register('ConsumerApiManualTaskRouter', ManualTaskEndpoint.ManualTaskRouter)
    .dependencies('ConsumerApiManualTaskController', 'IdentityService')
    .singleton()
    .tags(routerDiscoveryTag);

  container.register('ConsumerApiManualTaskController', ManualTaskEndpoint.ManualTaskController)
    .dependencies('ConsumerApiManualTaskService')
    .singleton();

  container.register('ConsumerApiProcessModelRouter', ProcessModelEndpoint.ProcessModelRouter)
    .dependencies('ConsumerApiProcessModelController', 'IdentityService')
    .singleton()
    .tags(routerDiscoveryTag);

  container.register('ConsumerApiProcessModelController', ProcessModelEndpoint.ProcessModelController)
    .dependencies('ConsumerApiProcessModelService')
    .singleton();

  container.register('ConsumerApiUserTaskRouter', UserTaskEndpoint.UserTaskRouter)
    .dependencies('ConsumerApiUserTaskController', 'IdentityService')
    .singleton()
    .tags(routerDiscoveryTag);

  container.register('ConsumerApiUserTaskController', UserTaskEndpoint.UserTaskController)
    .dependencies('ConsumerApiUserTaskService')
    .singleton();
}

function registerSocketEndpoints(container) {

  container.register('ConsumerApiNotificationSocketEndpoint', NotificationEndpoint.NotificationSocketEndpoint)
    .dependencies('EventAggregator', 'IdentityService', 'ConsumerApiNotificationService')
    .singleton()
    .tags(socketEndpointDiscoveryTag);
}

module.exports.registerInContainer = registerInContainer;
