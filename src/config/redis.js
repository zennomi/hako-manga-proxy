const redis = require('redis');
const { endpointUri, password } = require('../config/config').redis;

const redisClient = password ? redis.createClient({ url: `redis://${endpointUri}`, password }) : redis.createClient();

module.exports = redisClient;