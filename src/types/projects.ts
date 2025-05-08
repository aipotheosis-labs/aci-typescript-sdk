export type AllowedApp = string;

export interface ProjectAgent {
  id: string;
  allowed_apps?: AllowedApp[];
}

export interface UpdateAgentAllowedAppsRequest {
  allowed_apps: AllowedApp[];
}

export interface ProjectAgentResponse {
  id: string;
  allowed_apps: AllowedApp[];
}
