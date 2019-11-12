/* eslint-env jest */
const request = require('supertest')
const waitOn = require('wait-on')

const URL = process.env.TRANSFORMATION_API || 'http://localhost:9000/transformation'

const MOCK_RECEIVER_PORT = process.env.MOCK_RECEIVER_PORT || 8081
const MOCK_RECEIVER_HOST = process.env.MOCK_RECEIVER_HOST || 'localhost'
const MOCK_RECEIVER_URL = 'http://' + MOCK_RECEIVER_HOST + ':' + MOCK_RECEIVER_PORT

describe('Scheduler', () => {
  console.log('Scheduler-Service URL= ' + URL)

  beforeAll(async () => {
    const pingUrl = URL + '/'
    console.log('Waiting for transformation-service with URL: ' + pingUrl)
    console.log('Waiting for mock webhook receiver with URL: ' + MOCK_RECEIVER_URL)
    await waitOn({ resources: [pingUrl, MOCK_RECEIVER_URL], timeout: 50000 })
  }, 60000)

  test('GET /version', async () => {
    const response = await request(URL).get('/version')
    expect(response.status).toEqual(200)
    expect(response.type).toEqual('text/plain')
    const semanticVersionReExp = '^(0|[1-9]d*).(0|[1-9]d*).(0|[1-9]d*)'
    expect(response.text).toMatch(new RegExp(semanticVersionReExp))
  })

  test('POST /job numerical', async () => {
    const simpleJob = {
      func: 'return 1;',
      data: {}
    }

    const response = await request(URL)
      .post('/job')
      .send(simpleJob)

    expect(response.status).toEqual(200)
    expect(response.type).toEqual('application/json')
    const { data, stats } = response.body
    expect(data).toEqual(1)
    expect(stats.durationInMilliSeconds).toBeGreaterThan(0)
    expect(stats.endTimestamp).toBeGreaterThanOrEqual(stats.startTimestamp)
  })

  test('POST /job', async () => {
    const simpleJob = {
      func: 'return {number: 1};',
      data: {}
    }

    const response = await request(URL)
      .post('/job')
      .send(simpleJob)

    expect(response.status).toEqual(200)
    expect(response.type).toEqual('application/json')
    const { data, stats } = response.body
    expect(data).toEqual({ number: 1 })
    expect(stats.durationInMilliSeconds).toBeGreaterThan(0)
    expect(stats.endTimestamp).toBeGreaterThanOrEqual(stats.startTimestamp)
  })

  test('POST /job with transformation', async () => {
    const transformationJob = {
      func: 'return {numberTwo: data.number+1};',
      data: { number: 1 }
    }

    const response = await request(URL)
      .post('/job')
      .send(transformationJob)

    expect(response.status).toEqual(200)
    expect(response.type).toEqual('application/json')
    const { data, stats } = response.body
    expect(data).toEqual({ numberTwo: 2 })
    expect(stats.durationInMilliSeconds).toBeGreaterThan(0)
    expect(stats.endTimestamp).toBeGreaterThanOrEqual(stats.startTimestamp)
  })

  test('POST /job with syntax error', async () => {
    const transformationJob = {
      func: 'syntax error;\nreturn data;',
      data: { number: 1 }
    }

    const response = await request(URL)
      .post('/job')
      .send(transformationJob)

    expect(response.status).toEqual(400)
    expect(response.type).toEqual('application/json')
    const { data, error, stats } = response.body
    expect(data).toBe(undefined)
    expect(error.name).toEqual('SyntaxError')
    expect(error.lineNumber).toBe(1)
    expect(error.position).toBe(7)
    expect(stats.durationInMilliSeconds).toBeGreaterThan(0)
    expect(stats.endTimestamp).toBeGreaterThanOrEqual(stats.startTimestamp)
  })

  test('POST /job with reference error', async () => {
    const transformationJob = {
      func: 'return somethingThatIsntThere;',
      data: { number: 1 }
    }

    const response = await request(URL)
      .post('/job')
      .send(transformationJob)

    expect(response.status).toEqual(400)
    expect(response.type).toEqual('application/json')
    const { data, error, stats } = response.body
    expect(data).toBe(undefined)
    expect(error.name).toEqual('ReferenceError')
    expect(error.lineNumber).toBe(1)
    expect(error.position).toBe(1)
    expect(stats.durationInMilliSeconds).toBeGreaterThan(0)
    expect(stats.endTimestamp).toBeGreaterThanOrEqual(stats.startTimestamp)
  })

  test('POST /job with no return data', async () => {
    const transformationJob = {
      func: 'data.a *= 2;',
      data: { a: 1 }
    }

    const response = await request(URL)
      .post('/job')
      .send(transformationJob)

    expect(response.status).toEqual(400)
    expect(response.type).toEqual('application/json')
    const { data, error, stats } = response.body
    expect(data).toBe(undefined)
    expect(error.name).toEqual('MissingReturnError')
    expect(error.lineNumber).toBe(0)
    expect(error.position).toBe(0)
    expect(stats.durationInMilliSeconds).toBeGreaterThan(0)
    expect(stats.endTimestamp).toBeGreaterThanOrEqual(stats.startTimestamp)
  })

  test('POST /notification triggers webhook', async () => {
    const dataLocation = 'storage/1234'
    const notificationJob = {
      url: MOCK_RECEIVER_URL + '/webhook1',
      dataLocation: dataLocation,
      data: {
        value1: 1
      },
      condition: 'data.value1 > 0',
      notificationType: 'WEBHOOK'
    }

    const transformationResponse = await request(URL)
      .post('/notification')
      .send(notificationJob)

    expect(transformationResponse.status).toEqual(202)
    await sleep(3000) // wait for processing

    const receiverResponse = await request(MOCK_RECEIVER_URL)
      .get('/data1')

    expect(receiverResponse.status).toEqual(200)
    expect(receiverResponse.body.location).toEqual(dataLocation)
  })

  test('POST /notification does not trigger webhook when condition is false', async () => {
    const notificationJob = {
      url: MOCK_RECEIVER_URL + '/webhook2',
      dataLocation: 'storage/1234',
      data: {
        value1: 1
      },
      condition: 'data.value1 < 0',
      type: 'WEBHOOK'
    }

    const transformationResponse = await request(URL)
      .post('/notification')
      .send(notificationJob)

    expect(transformationResponse.status).toEqual(202)
    await sleep(3000)

    const receiverResponse = await request(MOCK_RECEIVER_URL)
      .get('/data2')

    expect(receiverResponse.status).toEqual(404)
  })

  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
})
