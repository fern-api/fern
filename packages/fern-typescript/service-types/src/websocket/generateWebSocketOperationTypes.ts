import { WebSocketChannel, WebSocketOperation } from "@fern-fern/ir-model";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedWebSocketOperationTypes, ModelContext } from "@fern-typescript/model-context";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";

export function generateWebSocketOperationTypes({
    channel,
    operation,
    modelContext,
    dependencyManager,
}: {
    channel: WebSocketChannel;
    operation: WebSocketOperation;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}): GeneratedWebSocketOperationTypes {
    return {
        request: generateRequestTypes({
            channelName: channel.name,
            operation,
            modelContext,
        }),
        response: generateResponseTypes({
            channelName: channel.name,
            operation,
            modelContext,
            dependencyManager,
        }),
    };
}
