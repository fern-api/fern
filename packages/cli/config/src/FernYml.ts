import type { Sourced } from "@fern-api/source";
import type { FernYmlSchema } from "./schemas/FernYmlSchema";

export namespace FernYml {
    export const FILENAME = "fern.yml";
}

export interface FernYml {
    /** Tracks the original source of the fern.yml */
    source: Sourced<FernYmlSchema>;

    edition: string;
    org: string;
    cli?: CliConfig;
    sdks?: SdksConfig;
}

export interface CliConfig {
    version?: string;
}

export interface SdksConfig {
    autorelease?: boolean;
    defaultGroup?: string;
    readme?: ReadmeConfig;
    targets?: SdkTargetsConfig;
}

export interface ReadmeConfig {
    defaultEndpoint?: string;
}

export type SdkTargetsConfig = {
    [targetName: string]: SdkTarget;
};

export interface SdkTarget {
    lang?: string;
    version?: string;
    config?: unknown;
    publish?: PublishConfig;
    output?: OutputConfig;
    group?: string[];
}

export interface PublishConfig {
    npm?: NpmPublishConfig;
}

export interface NpmPublishConfig {
    packageName: string;
}

export interface OutputConfig {
    path?: string;
    git?: GitOutputConfig;
}

export interface GitOutputConfig {
    repository: string;
}
