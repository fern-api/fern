import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-client";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export interface GeneratorsConfiguration {
    absolutePathToConfiguration: AbsoluteFilePath;
    rawConfiguration: GeneratorsConfigurationSchema;
    draft: DraftGeneratorInvocation[];
    release: ReleaseGeneratorInvocation[];
}

export type GeneratorInvocation = DraftGeneratorInvocation | ReleaseGeneratorInvocation;

export interface DraftGeneratorInvocation extends BaseGeneratorInvocation {
    type: "draft";
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
}

export interface ReleaseGeneratorInvocation extends BaseGeneratorInvocation {
    type: "release";
}

export interface BaseGeneratorInvocation {
    name: string;
    version: string;
    config: unknown;
    outputMode: FernFiddle.remoteGen.OutputMode;
    audiences: string[];
}
