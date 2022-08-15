import { FernConstants } from "@fern-fern/ir-model";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { ServiceTypesGenerationMode } from "../types";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";

export function generateHttpEndpointTypes({
    service,
    endpoint,
    modelContext,
    dependencyManager,
    fernConstants,
    mode,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
    fernConstants: FernConstants;
    mode: ServiceTypesGenerationMode;
}): GeneratedHttpEndpointTypes {
    return {
        request: generateRequestTypes({
            service,
            endpoint,
            modelContext,
            mode,
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
