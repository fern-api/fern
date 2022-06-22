import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, ModelContext } from "@fern-typescript/commons";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedWebSocketOperationTypes } from "./types";

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
