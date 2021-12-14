import { RequestOptions, ResponseOptions } from '@pact-foundation/pact';
import { eachLike } from '@pact-foundation/pact/src/dsl/matchers';

import {
  NotificationType,
  WebhookNotification,
} from './notification/notificationConfig';
import { NotificationApiReadModel } from './notification/notificationRest';

export const exampleNotificationConfig: WebhookNotification = {
  id: 1,
  pipelineId: 1,
  condition: 'true',
  type: NotificationType.WEBHOOK,
  parameters: {
    url: 'https://url.to.webhook.com/hook',
  },
};

export const exampleNotificationConfigReadModel: NotificationApiReadModel = {
  id: 1,
  pipelineId: 1,
  condition: 'true',
  type: NotificationType.WEBHOOK,
  parameter: {
    url: 'https://url.to.webhook.com/hook',
  },
};

export function getNotificationsForPipelineRequestTitle(
  pipelineId: number,
): string {
  return `a request for getting all notification configs for the pipeline with id ${pipelineId}`;
}

export function getNotificationsForPipelineRequest(
  pipelineId: number,
): RequestOptions {
  return {
    method: 'GET',
    path: `/configs`,
    query: {
      pipelineId: pipelineId.toString(),
    },
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

export const getNotificationsForPipelineSuccessReponse: ResponseOptions = {
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: eachLike(exampleNotificationConfigReadModel),
};

export const getNotificationsForPipelineEmptySuccessResponse: ResponseOptions =
  {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: [],
  };
