import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-client";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export interface GeneratorsConfiguration {
    absolutePathToConfiguration: AbsoluteFilePath;
    rawConfiguration: GeneratorsConfigurationSchema;
    defaultGroup: string | undefined;
    groups: GeneratorGroup[];
}

export interface GeneratorGroup {
    groupName: string;
    audiences: AllAudiences | SelectAudiences;
    generators: GeneratorInvocation[];
}

export interface AllAudiences {
    type: "all";
}

export interface SelectAudiences {
    type: "select";
    audiences: string[];
}

export interface GeneratorInvocation {
    name: string;
    version: string;
    config: unknown;
    outputMode: FernFiddle.remoteGen.OutputMode;
}
