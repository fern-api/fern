import { HttpEndpoint, TypeName } from "@fern-api/api";
import { DependencyManager, ErrorResolver, ModelContext, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedHttpEndpointTypes } from "./types";

export function generateHttpEndpointTypes({
    serviceName,
    endpoint,
    modelDirectory,
    modelContext,
    typeResolver,
    errorResolver,
    dependencyManager,
}: {
    serviceName: TypeName;
    endpoint: HttpEndpoint;
    modelDirectory: Directory;
    modelContext: ModelContext;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    dependencyManager: DependencyManager;
}): GeneratedHttpEndpointTypes {
    return {
        request: generateRequestTypes({
            serviceName,
            endpoint,
            modelDirectory,
            modelContext,
            typeResolver,
        }),
        response: generateResponseTypes({
            serviceName,
            endpoint,
            modelDirectory,
            modelContext,
            typeResolver,
            errorResolver,
            dependencyManager,
        }),
    };
}
