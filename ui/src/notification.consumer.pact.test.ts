import path from 'path';

import { JestPactOptions, pactWith } from 'jest-pact';

import {
  exampleNotificationConfig,
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
    });
  });
});
