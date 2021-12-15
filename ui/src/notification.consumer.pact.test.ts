import path from 'path';

import { JestPactOptions, pactWith } from 'jest-pact';

import {
  createNotificationRequest,
  createNotificationRequestTitle,
  createNotificationResponse,
  exampleCreateNotificationConfig,
  exampleNotificationConfig,
  getNotificationNotFoundResponse,
  getNotificationRequest,
  getNotificationRequestTitle,
  getNotificationSuccessResponse,
  getNotificationsForPipelineEmptySuccessResponse,
  getNotificationsForPipelineRequest,
  getNotificationsForPipelineRequestTitle,
  getNotificationsForPipelineSuccessReponse,
} from './notification.consumer.pact.fixtures';
import { NotificationRest } from './notification/notificationRest';

const options: JestPactOptions = {
  consumer: 'UI',
  provider: 'notification',
  dir: path.resolve(process.cwd(), '..', 'pacts'),
  logDir: path.resolve(process.cwd(), '..', 'pacts', 'logs'),
  pactfileWriteMode: 'overwrite',
};

pactWith(options, (provider) => {
  let restService: NotificationRest;

  beforeAll(() => {
    const notificationServiceUrl = provider.mockService.baseUrl;
    restService = new NotificationRest(notificationServiceUrl);
  });

  describe('get all notification configs for a pipeline', () => {
    describe('when notification configs for this pipeline exist', () => {
      const pipelineId = 1;

      beforeEach(async () => {
        await provider.addInteraction({
          state: `notification configs for pipeline ${pipelineId} exist`,
          uponReceiving: getNotificationsForPipelineRequestTitle(pipelineId),
          withRequest: getNotificationsForPipelineRequest(pipelineId),
          willRespondWith: getNotificationsForPipelineSuccessReponse,
        });
      });

      it('returns an array containing the notification configs', async () => {
        const configs = await restService.getAllByPipelineId(pipelineId);

        expect(configs).toStrictEqual([exampleNotificationConfig]);
      });
    });

    describe('when notification configs for this pipeline do not exist', () => {
      const pipelineId = 1;

      beforeEach(async () => {
        await provider.addInteraction({
          state: `notification configs for pipeline ${pipelineId} do not exist`,
          uponReceiving: getNotificationsForPipelineRequestTitle(pipelineId),
          withRequest: getNotificationsForPipelineRequest(pipelineId),
          willRespondWith: getNotificationsForPipelineEmptySuccessResponse,
        });
      });

      it('returns an empty array', async () => {
        const configs = await restService.getAllByPipelineId(pipelineId);

        expect(configs).toStrictEqual([]);
      });
    });
  });

  describe('get notification by id', () => {
    describe('when notification config exists', () => {
      const id = 1;

      beforeEach(async () => {
        await provider.addInteraction({
          state: `notification config with id ${id} exists`,
          uponReceiving: getNotificationRequestTitle(id),
          withRequest: getNotificationRequest(id),
          willRespondWith: getNotificationSuccessResponse,
        });
      });

      it('returns the requested notification config', async () => {
        const config = await restService.getById(id);

        expect(config).toStrictEqual(exampleNotificationConfig);
      });
    });

    describe('when notification config does not exist', () => {
      const id = 1;

      beforeEach(async () => {
        await provider.addInteraction({
          state: `notification config with id ${id} does not exist`,
          uponReceiving: getNotificationRequestTitle(id),
          withRequest: getNotificationRequest(id),
          willRespondWith: getNotificationNotFoundResponse,
        });
      });

      it('throws an error', async () => {
        await expect(restService.getById(id)).rejects.toThrow(Error);
      });
    });
  });

  describe('creating a notification config', () => {
    describe('with a valid notification config', () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state: `any state`,
          uponReceiving: createNotificationRequestTitle,
          withRequest: createNotificationRequest,
          willRespondWith: createNotificationResponse,
        });
      });

      it('returns the created notification config', async () => {
        const config = await restService.create(
          exampleCreateNotificationConfig,
        );

        expect(config).toStrictEqual(exampleCreateNotificationConfig);
      });
    });
  });
});
