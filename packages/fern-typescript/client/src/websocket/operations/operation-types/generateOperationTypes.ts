import { WebSocketChannel, WebSocketOperation } from "@fern-api/api";
import { getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedOperationTypes } from "./types";

export function generateOperationTypes({
    channel,
    operation,
    operationsDirectory,
    modelDirectory,
    errorsDirectory,
    servicesDirectory,
    typeResolver,
}: {
    channel: WebSocketChannel;
    operation: WebSocketOperation;
    operationsDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    servicesDirectory: Directory;
    typeResolver: TypeResolver;
}): GeneratedOperationTypes {
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
            errorsDirectory,
            servicesDirectory,
            typeResolver,
        }),
    };
}
