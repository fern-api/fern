import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { WebSocketChannel, WebSocketOperation } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import { generateHttpEndpointTypes } from "./http/generateHttpEndpointTypes";
import { generateWebSocketOperationTypes } from "./websocket/generateWebSocketOperationTypes";

export function generateServiceTypeFiles({
    intermediateRepresentation,
    modelContext,
    dependencyManager,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}): void {
    for (const service of intermediateRepresentation.services.http) {
        for (const endpoint of service.endpoints) {
            const generatedTypes = generateHttpEndpointTypes({
                serviceName: service.name,
                endpoint,
                modelContext,
                dependencyManager,
            });
            modelContext.registerGeneratedHttpServiceTypes({
                serviceName: service.name,
                endpointId: endpoint.endpointId,
                generatedTypes,
            });
        }
    }

    for (const channel of intermediateRepresentation.services.websocket) {
        registerOperations({
            channel,
            operations: channel.client.operations,
            modelContext,
            dependencyManager,
        });
        registerOperations({
            channel,
            operations: channel.server.operations,
            modelContext,
            dependencyManager,
        });
    }
}

function registerOperations({
    channel,
    operations,
    modelContext,
    dependencyManager,
}: {
    channel: WebSocketChannel;
    operations: WebSocketOperation[];
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}) {
    for (const operation of operations) {
        const generatedTypes = generateWebSocketOperationTypes({
            channel,
            operation,
            modelContext,
            dependencyManager,
        });
        modelContext.registerGeneratedWebSocketChannelTypes({
            channelName: channel.name,
            operationId: operation.operationId,
            generatedTypes,
        });
    }
}
