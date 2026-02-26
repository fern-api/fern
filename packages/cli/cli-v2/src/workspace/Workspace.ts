import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { AiConfig } from "../ai/config/AiConfig.js";
import type { ApiDefinition } from "../api/config/ApiDefinition.js";
import type { DocsConfig } from "../docs/config/DocsConfig.js";
import type { SdkConfig } from "../sdk/config/SdkConfig.js";

/**
 * Top-level workspace defined by fern.yml.
 *
 * A workspace contains zero or more API definitions, each of which
 * can be independently transformed to IR and referenced by SDKs
 * and/or docs.
 */
export interface Workspace {
    /** Absolute path to fern.yml. Optional for flag-based workspace construction. */
    absoluteFilePath?: AbsoluteFilePath;
    ai?: AiConfig;
    apis: Record<string, ApiDefinition>;
    cliVersion: string;
    docs?: DocsConfig;
    org: string;
    sdks?: SdkConfig;
}
