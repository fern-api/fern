import { FernConstants, IntermediateRepresentation } from "@fern-fern/ir-model";
import { WebSocketChannel, WebSocketOperation } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import { generateHttpEndpointTypes } from "./http/generateHttpEndpointTypes";
import { ServiceTypesGenerationMode } from "./types";
import { generateWebSocketOperationTypes } from "./websocket/generateWebSocketOperationTypes";

export function generateServiceTypeFiles({
    intermediateRepresentation,
    modelContext,
    dependencyManager,
    fernConstants,
    mode,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
    mode: ServiceTypesGenerationMode;
}): void {
    for (const service of intermediateRepresentation.services.http) {
        for (const endpoint of service.endpoints) {
            const generatedTypes = generateHttpEndpointTypes({
                service,
                endpoint,
                modelContext,
                dependencyManager,
                fernConstants,
                mode,
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
            fernConstants,
        });
        registerOperations({
            channel,
            operations: channel.server.operations,
            modelContext,
            dependencyManager,
            fernConstants,
        });
    }
}

function registerOperations({
    channel,
    operations,
    modelContext,
    dependencyManager,
    fernConstants,
}: {
    channel: WebSocketChannel;
    operations: WebSocketOperation[];
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
}) {
    for (const operation of operations) {
        const generatedTypes = generateWebSocketOperationTypes({
            channel,
            operation,
            modelContext,
            dependencyManager,
            fernConstants,
        });
        modelContext.registerGeneratedWebSocketChannelTypes({
            channelName: channel.name,
            operationId: operation.operationId,
            generatedTypes,
        });
    }
}
