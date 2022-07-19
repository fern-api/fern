import { GeneratorConfig } from "@fern-fern/ir-model/generators";

export interface PublishConfig {
    apiKey: string;
    workspaceId: string | undefined;
}

const POSTMAN_API_KEY_CONFIG = "api-key";
const POSTMAN_WORKSPACE_ID_CONFIG = "workspace-id";
export function getPublishConfig(config: GeneratorConfig): PublishConfig | undefined {
    const apiKey = config.customConfig[POSTMAN_API_KEY_CONFIG];
    if (apiKey != null) {
        const workspaceId = config.customConfig[POSTMAN_WORKSPACE_ID_CONFIG];
        return { apiKey, workspaceId };
    }
    return undefined;
}
