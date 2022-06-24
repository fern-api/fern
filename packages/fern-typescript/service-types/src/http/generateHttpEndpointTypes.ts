import { HttpEndpoint, TypeName } from "@fern-api/api";
import { DependencyManager } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";

export function generateHttpEndpointTypes({
    serviceName,
    endpoint,
    modelContext,
    dependencyManager,
}: {
    serviceName: TypeName;
    endpoint: HttpEndpoint;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
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
        }),
    };
}
