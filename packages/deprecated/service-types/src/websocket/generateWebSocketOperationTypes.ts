import { FernConstants } from "@fern-fern/ir-model/ir";
import { WebSocketChannel, WebSocketOperation } from "@fern-fern/ir-model/services/websocket";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedWebSocketOperationTypes, ModelContext } from "@fern-typescript/model-context";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";

export function generateWebSocketOperationTypes({
    channel,
    operation,
    modelContext,
    dependencyManager,
    fernConstants,
}: {
    channel: WebSocketChannel;
    operation: WebSocketOperation;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
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
            fernConstants,
        }),
    };
}
