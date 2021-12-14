import axios, { AxiosInstance } from 'axios';

import NotificationConfig, {
  NotificationParameters,
  NotificationType,
} from '@/notification/notificationConfig';

export class NotificationRest {
  private readonly axiosInstance: AxiosInstance;

  constructor(url: string) {
    /**
     * Axios instance with default headers and base url.
     * The option transformResponse is set to an empty array
     * because of explicit JSON.parser call with custom reviver.
     */
    this.axiosInstance = axios.create({
      baseURL: url,
      headers: { 'Content-Type': 'application/json' },
      transformResponse: [],
    });
  }

  async getAllByPipelineId(pipelineId: number): Promise<NotificationConfig[]> {
    const response = await this.axiosInstance.get(
      `/configs?pipelineId=${pipelineId}`,
    );
    const notifications = JSON.parse(
      response.data,
    ) as NotificationApiReadModel[];
    return fromApiReadModels(notifications);
  }

  async getById(id: number): Promise<NotificationConfig> {
    const response = await this.axiosInstance.get(`/configs/${id}`);
    const notificationApiModel = JSON.parse(
      response.data,
    ) as NotificationApiReadModel;
    return fromApiReadModel(notificationApiModel);
  }

  async create(
    notificationConfig: NotificationConfig,
  ): Promise<NotificationConfig> {
    const apiModel = toApiWriteModel(notificationConfig);

    const response = await this.axiosInstance.post(
      '/configs',
      JSON.stringify(apiModel),
    );
    const notificationApiModel = JSON.parse(
      response.data,
    ) as NotificationApiReadModel;
    return fromApiReadModel(notificationApiModel);
  }

  async update(notificationConfig: NotificationConfig): Promise<void> {
    const id = notificationConfig.id;
    const apiModel = toApiWriteModel(notificationConfig);

    return await this.axiosInstance.put(
      `/configs/${id}`,
      JSON.stringify(apiModel),
    );
  }

  async remove(notificationConfig: NotificationConfig): Promise<void> {
    const id = notificationConfig.id;

    return await this.axiosInstance.delete(`/configs/${id}`);
  }
}

export interface NotificationApiReadModel extends NotificationApiWriteModel {
  id: number;
}

export interface NotificationApiWriteModel {
  pipelineId: number;
  condition: string;
  type: ApiNotificationType;
  parameter: NotificationParameters | Record<string, unknown>;
}

type ApiNotificationType = 'WEBHOOK' | 'SLACK' | 'FCM';

function toApiWriteModel(
  notification: NotificationConfig,
): NotificationApiWriteModel {
  return {
    pipelineId: notification.pipelineId,
    condition: notification.condition,
    type: notification.type,
    parameter: notification.parameters,
  };
}

function fromApiReadModel(
  notificationApiModel: NotificationApiReadModel,
): NotificationConfig {
  return {
    id: notificationApiModel.id,
    pipelineId: notificationApiModel.pipelineId,
    condition: notificationApiModel.condition,
    type: NotificationType[notificationApiModel.type],
    parameters: notificationApiModel.parameter,
  };
}

function fromApiReadModels(
  notificationApiModels: NotificationApiReadModel[],
): NotificationConfig[] {
  return notificationApiModels.map((x) => fromApiReadModel(x));
}
