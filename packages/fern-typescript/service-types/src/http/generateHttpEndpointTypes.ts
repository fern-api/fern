import { HttpEndpoint, TypeName } from "@fern-api/api";
import { DependencyManager, ErrorResolver, ModelContext, TypeResolver } from "@fern-typescript/commons";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedHttpEndpointTypes } from "./types";

export function generateHttpEndpointTypes({
    serviceName,
    endpoint,
    modelContext,
    typeResolver,
    errorResolver,
    dependencyManager,
}: {
    serviceName: TypeName;
    endpoint: HttpEndpoint;
    modelContext: ModelContext;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    dependencyManager: DependencyManager;
}): GeneratedHttpEndpointTypes {
    return {
        request: generateRequestTypes({
            serviceName,
            endpoint,
            modelContext,
            typeResolver,
        }),
        response: generateResponseTypes({
            serviceName,
            endpoint,
            modelContext,
            typeResolver,
            errorResolver,
            dependencyManager,
        }),
    };
}
