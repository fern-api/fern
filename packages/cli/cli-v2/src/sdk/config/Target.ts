import { schemas } from "@fern-api/config";
import type { Language } from "./Language";
import type { OutputConfig } from "./OutputConfig";
import type { PublishConfig } from "./PublishConfig";

export interface Target {
    /** Target name from fern.yml (e.g., "node", "python") */
    name: string;
    /** The API this target is generating for (default: 'api') */
    api: string;
    /** Resolved Docker image reference (e.g., "fernapi/fern-typescript-sdk") */
    image: string;
    /** Target language */
    lang: Language;
    /** SDK version to generate */
    version: string;
    /** Output configuration for local/git publishing */
    output: OutputConfig;
    /** Target-specific configuration */
    config?: Record<string, unknown>;
    /** Publish configuration for package registries */
    publish?: PublishConfig;
    /** Groups this target belongs to */
    groups?: string[];
    /** README.md configuration */
    readme?: schemas.ReadmeSchema;
    /** Configure smart casing for generated code (default: true) */
    smartCasing?: boolean;
}
