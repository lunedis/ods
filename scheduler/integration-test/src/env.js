const { readEnvOrDie } = require('@jvalue/node-dry-basics')

const SCHEDULER_URL = readEnvOrDie('SCHEDULER_API')
const AMQP_URL = readEnvOrDie('AMQP_URL')
const AMQP_CONNECTION_RETRIES = +readEnvOrDie('AMQP_CONNECTION_RETRIES')
const AMQP_CONNECTION_BACKOFF = +readEnvOrDie('AMQP_CONNECTION_BACKOFF')
const MOCK_SERVER_PORT = +readEnvOrDie('MOCK_SERVER_PORT')
const MOCK_SERVER_URL = readEnvOrDie('MOCK_SERVER_API')

module.exports = {
  SCHEDULER_URL,
  AMQP_URL,
  AMQP_CONNECTION_RETRIES,
  AMQP_CONNECTION_BACKOFF,
  MOCK_SERVER_PORT,
  MOCK_SERVER_URL
}
