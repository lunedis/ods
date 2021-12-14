import path from 'path';

import { Verifier } from '@pact-foundation/pact';

import {
  NotificationConfig,
  NotificationType,
} from './notification-config/notificationConfig';
import { PostgresNotificationRepository } from './notification-config/postgresNotificationRepository';

import { port, server } from './index'; // The main method is automatically called due to this import

const notificationConfigs: NotificationConfig[] = [];

jest.mock('./notification-config/postgresNotificationRepository', () => {
  return {
    initNotificationRepository: jest
      .fn()
      .mockImplementation(async () =>
        Promise.resolve(new PostgresNotificationRepository()),
      ),
    PostgresNotificationRepository: jest.fn().mockImplementation(() => {
      return {
        getForPipeline: jest
          .fn()
          .mockImplementation(async (pipelineId: number) =>
            Promise.resolve(
              notificationConfigs.filter((n) => n.pipelineId === pipelineId),
            ),
          ),
        getById: jest
          .fn()
          .mockImplementation(async (id: number) =>
            Promise.resolve(notificationConfigs.find((n) => n.id === id)),
          ),
        getAll: jest.fn().mockImplementation(() => notificationConfigs),
        // Create,
        // Update,
        // Delete
      };
    }),
  };
});

// The following mocks are needed for propper execution of the main function
jest.mock('@jvalue/node-dry-amqp', () => {
  return {
    AmqpConnection: jest.fn(),
  };
});

jest.mock('./api/amqp/pipelineSuccessConsumer', () => {
  return {
    createPipelineSuccessConsumer: jest.fn(),
  };
});

describe('Pact Provider Verification', () => {
  it('validates the expectations of the UI', async () => {
    const verifier = new Verifier({
      provider: 'Notification',
      providerBaseUrl: `http://localhost:${port}`,
      pactUrls: [
        path.resolve(process.cwd(), '..', 'pacts', 'ui-notification.json'),
      ],
      logDir: path.resolve(process.cwd(), '..', 'pacts', 'logs'),
      stateHandlers: {
        'notification configs for pipeline 1 exist':
          setupSomeNotificationConfigs,
      },
    });
    await verifier.verifyProvider().finally(() => {
      server?.close();
    });
  });
});

function clearState(): void {
  notificationConfigs.splice(0, notificationConfigs.length);
}

async function setupSomeNotificationConfigs(): Promise<void> {
  clearState();

  notificationConfigs.push({
    id: 1,
    pipelineId: 1,
    condition: 'true',
    type: NotificationType.WEBHOOK,
    parameter: {
      url: 'https://url.to.webhook.com/hook',
    },
  });
  return Promise.resolve();
}
