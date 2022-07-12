import { GeneratorInvocation } from "@fern-api/commons";
import { RemoteGenTaskId } from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";

export interface GeneratorInvocationWithTaskId {
    taskId: RemoteGenTaskId | undefined;
    generatorInvocation: GeneratorInvocation;
}
