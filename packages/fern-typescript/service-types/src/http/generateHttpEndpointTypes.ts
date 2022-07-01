import { FernConstants } from "@fern-fern/ir-model";
import { HttpEndpoint, ServiceName } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";

export function generateHttpEndpointTypes({
    serviceName,
    endpoint,
    modelContext,
    dependencyManager,
    fernConstants,
}: {
    serviceName: ServiceName;
    endpoint: HttpEndpoint;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
}): GeneratedHttpEndpointTypes {
    return {
        request: generateRequestTypes({
            serviceName,
            endpoint,
            modelContext,
        }),
        response: generateResponseTypes({
            serviceName,
            endpoint,
            modelContext,
            dependencyManager,
            fernConstants,
        }),
    };
}
