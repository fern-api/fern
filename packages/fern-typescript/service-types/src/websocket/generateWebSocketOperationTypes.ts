import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import { DependencyManager, getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedWebSocketOperationTypes } from "./types";

export function generateWebSocketOperationTypes({
    channel,
    operation,
    operationsDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
    dependencyManager,
}: {
    channel: WebSocketChannel;
    operation: WebSocketOperation;
    operationsDirectory: Directory;
    modelDirectory: Directory;
    servicesDirectory: Directory;
    typeResolver: TypeResolver;
    dependencyManager: DependencyManager;
}): GeneratedWebSocketOperationTypes {
    const operationDirectory = getOrCreateDirectory(operationsDirectory, operation.operationId, {
        exportOptions: {
            type: "namespace",
            namespace: operation.operationId,
        },
    });

    return {
        methodName: operation.operationId,
        request: generateRequestTypes({
            channelName: channel.name,
            operation,
            operationDirectory,
            modelDirectory,
            servicesDirectory,
            typeResolver,
        }),
        response: generateResponseTypes({
            channelName: channel.name,
            operation,
            operationDirectory,
            modelDirectory,
            servicesDirectory,
            typeResolver,
            dependencyManager,
        }),
    };
}
