import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, ErrorResolver, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedWebSocketOperationTypes } from "./types";

export function generateWebSocketOperationTypes({
    channel,
    operation,
    modelDirectory,
    typeResolver,
    errorResolver,
    dependencyManager,
}: {
    channel: WebSocketChannel;
    operation: WebSocketOperation;
    modelDirectory: Directory;
    errorResolver: ErrorResolver;
    typeResolver: TypeResolver;
    dependencyManager: DependencyManager;
}): GeneratedWebSocketOperationTypes {
    return {
        request: generateRequestTypes({
            channelName: channel.name,
            operation,
            modelDirectory,
            typeResolver,
        }),
        response: generateResponseTypes({
            channelName: channel.name,
            operation,
            modelDirectory,
            typeResolver,
            errorResolver,
            dependencyManager,
        }),
    };
}
