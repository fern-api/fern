import { HttpEndpoint, TypeName } from "@fern-api/api";
import { DependencyManager, GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/commons";
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
