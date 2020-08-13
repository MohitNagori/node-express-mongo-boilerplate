'use strict';
const _ = require('lodash');
const redis = require('redis');
let client;

/**
 * @module redis-client-helper
 * @description - provide a redis client to system for caching and other purpose
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @return {redis.createClient} client - The redis client
 */
module.exports = (config) => {
  if (_.isEmpty(config) || _.isEmpty(config.REDIS)) {
    // eslint-disable-next-line no-console
    console.log('Required configuration not found while making a connection with redis');
    return process.exit(1);
  }
  let redisUrl = process.env.REDIS_URL || config.REDIS;
  client = redis.createClient(redisUrl);

  client.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('Redis client connected');
  });

  client.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.log('An error occurred with redis client', err);
    process.exit(1);
  });
  return client;
};