'use strict'

const {
  ConsumerApiRouter,
  ConsumerApiController,
  ConsumerApiSocketEndpoint,
} = require('./dist/commonjs/index');

const routerDiscoveryTag = require('@essential-projects/bootstrapper_contracts').routerDiscoveryTag;
const socketEndpointDiscoveryTag = require('@essential-projects/bootstrapper_contracts').socketEndpointDiscoveryTag;

function registerInContainer(container) {
  container.register('ConsumerApiRouter', ConsumerApiRouter)
    .dependencies('ConsumerApiController')
    .singleton()
    .tags(routerDiscoveryTag);

  container.register('ConsumerApiController', ConsumerApiController)
    .dependencies('ConsumerApiService')
    .singleton();

  container.register('ConsumerApiSocketEndpoint', ConsumerApiSocketEndpoint)
    .dependencies('ConsumerApiService', 'EventAggregator')
    .singleton()
    .tags(socketEndpointDiscoveryTag);
}

module.exports.registerInContainer = registerInContainer;
