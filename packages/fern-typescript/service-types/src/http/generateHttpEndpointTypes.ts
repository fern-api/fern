import { FernConstants } from "@fern-fern/ir-model";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";

export function generateHttpEndpointTypes({
    service,
    endpoint,
    modelContext,
    dependencyManager,
    fernConstants,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
}): GeneratedHttpEndpointTypes {
    return {
        request: generateRequestTypes({
            service,
            endpoint,
            modelContext,
        }),
        response: generateResponseTypes({
            serviceName: service.name,
            endpoint,
            modelContext,
            dependencyManager,
            fernConstants,
        }),
    };
}
