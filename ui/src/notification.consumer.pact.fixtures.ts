import { RequestOptions, ResponseOptions } from '@pact-foundation/pact';
import { eachLike, like } from '@pact-foundation/pact/src/dsl/matchers';

import NotificationConfig, {
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

export const exampleCreateNotificationModel: NotificationConfig = {
  id: 1000,
  pipelineId: 5,
  condition: 'false',
  type: NotificationType.WEBHOOK,
  parameters: {
    url: 'https://url.to.new.webhook.com/hook',
  },
};

export const getNotificationsForPipelineRequestTitle = (
  pipelineId: number,
): string =>
  `a request for getting all notification configs for the pipeline with id ${pipelineId}`;

export const getNotificationsForPipelineRequest = (
  pipelineId: number,
): RequestOptions => ({
  method: 'GET',
  path: `/configs`,
  query: {
    pipelineId: pipelineId.toString(),
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const getNotificationRequestTitle = (id: number): string =>
  `a request for getting the notification config with id ${id}`;

export const getNotificationRequest = (id: number): RequestOptions => ({
  method: 'GET',
  path: `/configs/${id}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNotificationSuccessResponse: ResponseOptions = {
  status: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: like(exampleNotificationConfigReadModel),
};

export const getNotificationNotFoundResponse: ResponseOptions = {
  status: 404,
  body: '',
};

export const createNotificationRequestTitle =
  'a request for creating a new notification config';

export const createNotificationRequest: RequestOptions = {
  method: 'POST',
  path: '/configs',
  headers: {
    'Content-Type': 'application/json',
  },
  body: exampleCreateNotificationModel,
};

export const createNotificationResponse: ResponseOptions = {
  status: 201,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: like(exampleNotificationConfigReadModel),
};
