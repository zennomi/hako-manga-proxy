const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    // MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_HOST: Joi.string().default('127.0.0.1'),
    REDIS_PASSWORD: Joi.string(),
    REDIS_ENDPOINT_URI: Joi.string().default('127.0.0.1:6379').description('Redis url'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  // mongoose: {
  //   url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
  //   options: {
  //     useCreateIndex: true,
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //   },
  // },
  redis: {
    endpointUri: envVars.REDIS_ENDPOINT_URI
      || `${envVars.REDIS_HOST}:${envVars.REDIS_PORT}`
    ,
    password: envVars.REDIS_PASSWORD || undefined
  },
};
