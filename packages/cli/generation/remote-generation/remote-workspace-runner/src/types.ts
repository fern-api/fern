import { AbsoluteFilePath } from "@fern-api/core-utils";
import { DraftGeneratorInvocation } from "@fern-api/generators-configuration";
import { Fiddle } from "@fern-fern/fiddle-client-v2";

export interface GeneratorInvocationWithTaskId {
    taskId: Fiddle.remoteGen.RemoteGenTaskId | undefined;
    generatorInvocation: DraftGeneratorInvocation;
}
export interface GenericGeneratorInvocationSchema {
    name: string;
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
}
