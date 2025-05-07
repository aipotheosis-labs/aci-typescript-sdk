import { AxiosError } from 'axios';
import { APIResource } from './base';
import { ProjectAgentResponse, UpdateAgentAllowedAppsRequest } from '../types/projects';
import { ValidationError } from '../exceptions';
import { ProjectsSchema } from '../schemas';

export class ProjectsResource extends APIResource {
  /**
   * Update allowed apps for a specific agent within a project
   * @param projectId - The ID of the project
   * @param agentId - The ID of the agent
   * @param data - The allowed apps data to update
   */
  async updateAgentAllowedApps(
    projectId: string,
    agentId: string,
    data: UpdateAgentAllowedAppsRequest
  ): Promise<ProjectAgentResponse> {
    console.log('updateAgentAllowedApps', projectId, agentId, data);
    try {
      const validatedData = this.validateInput(ProjectsSchema.updateAgentAllowedApps, data);
      // print the request headers and request body
      console.log('request headers', this.client.defaults.headers);
      console.log('request body', validatedData);
      const response = await this.client.patch(
        `/projects/${projectId}/agents/${agentId}`,
        validatedData
      );
      return this.handleResponse<ProjectAgentResponse>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }
} 