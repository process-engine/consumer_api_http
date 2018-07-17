'use strict'

const {
  ConsumerApiRouter,
  ConsumerApiController,
} = require('./dist/commonjs/index');

const routerDiscoveryTag = require('@essential-projects/core_contracts').RouterDiscoveryTag;

function registerInContainer(container) {
  container.register('ConsumerApiRouter', ConsumerApiRouter)
    .dependencies('ConsumerApiController')
    .singleton()
    .tags(routerDiscoveryTag);

  container.register('ConsumerApiController', ConsumerApiController)
    .dependencies('ConsumerApiService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
