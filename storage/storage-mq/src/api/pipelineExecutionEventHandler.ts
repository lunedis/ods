import { StorageContentRepository } from '../storage-content/storageContentRepository'

export class PipelineExecutionEventHandler {
  constructor (private readonly contentRepository: StorageContentRepository) {}

  async handleSuccess (pipelineExecutedEvent: PipelineExecutedEvent): Promise<void> {
    await this.contentRepository.saveContent(pipelineExecutedEvent.pipelineId.toString(), {
      pipelineId: pipelineExecutedEvent.pipelineId,
      timestamp: pipelineExecutedEvent.timestamp ?? new Date(),
      data: pipelineExecutedEvent.data
    })
    if (pipelineExecutedEvent.schema !== undefined && pipelineExecutedEvent.schema !== null) {
      await this.contentRepository.saveContentForSchema(
        pipelineExecutedEvent.pipelineName + pipelineExecutedEvent.pipelineId.toString(), {
          pipelineId: pipelineExecutedEvent.pipelineId,
          timestamp: pipelineExecutedEvent.timestamp ?? new Date(),
          data: pipelineExecutedEvent.data,
          schema: pipelineExecutedEvent.schema
        }
      )
    }
  }
}

export interface PipelineExecutedEvent {
  pipelineId: number
  pipelineName: string
  data: unknown
  schema?: object
  timestamp?: Date
}
