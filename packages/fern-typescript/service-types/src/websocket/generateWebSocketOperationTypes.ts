import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, ErrorResolver, ModelContext, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedWebSocketOperationTypes } from "./types";

export function generateWebSocketOperationTypes({
    channel,
    operation,
    modelDirectory,
    modelContext,
    typeResolver,
    errorResolver,
    dependencyManager,
}: {
    channel: WebSocketChannel;
    operation: WebSocketOperation;
    modelDirectory: Directory;
    modelContext: ModelContext;
    errorResolver: ErrorResolver;
    typeResolver: TypeResolver;
    dependencyManager: DependencyManager;
}): GeneratedWebSocketOperationTypes {
    return {
        request: generateRequestTypes({
            channelName: channel.name,
            operation,
            modelDirectory,
            modelContext,
            typeResolver,
        }),
        response: generateResponseTypes({
            channelName: channel.name,
            operation,
            modelDirectory,
            modelContext,
            typeResolver,
            errorResolver,
            dependencyManager,
        }),
    };
}
