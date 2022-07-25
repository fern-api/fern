import { GeneratorInvocation } from "@fern-api/workspace-configuration";
import { RemoteGenTaskId } from "@fern-fern/fiddle-coordinator-api-client/model";

export interface GeneratorInvocationWithTaskId {
    taskId: RemoteGenTaskId | undefined;
    generatorInvocation: GeneratorInvocation;
}
