import type { ApiDefinition } from "../api/config/ApiDefinition";
import type { SdkConfig } from "../sdk/config/SdkConfig";

/**
 * Top-level workspace defined by fern.yml.
 *
 * A workspace contains zero or more API definitions, each of which
 * can be independently transformed to IR and referenced by SDKs
 * and/or docs.
 */
export interface Workspace {
    apis: Record<string, ApiDefinition>;
    org: string;
    cliVersion: string;
    sdks?: SdkConfig;
}
