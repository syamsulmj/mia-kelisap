export interface UserSettings {
  llm_provider: string;
  llm_model: string;
  has_openai_key: boolean;
  has_claude_key: boolean;
  debounce_seconds: number;
  agent_name: string;
  agent_tone: string;
  agent_instructions: string | null;
  response_length: string;
  avoid_markdown: boolean;
  use_simple_language: boolean;
  avoid_oversharing: boolean;
  contact_access_mode: string;
}

export interface UpdateSettingsRequest {
  llm_provider?: string;
  llm_model?: string;
  openai_api_key?: string;
  claude_api_key?: string;
  debounce_seconds?: number;
  agent_name?: string;
  agent_tone?: string;
  agent_instructions?: string;
  response_length?: string;
  avoid_markdown?: boolean;
  use_simple_language?: boolean;
  avoid_oversharing?: boolean;
  contact_access_mode?: string;
}
