import type {
    ErrorDeclaration,
    ExampleEndpointSuccessResponse,
    ExampleRequestBody,
    FernFilepath,
    IntermediateRepresentation,
    Name,
    TypeDeclaration
} from "@fern-api/ir-sdk";
import type { OpenAPIV3 } from "openapi-types";

import { convertServices } from "./converters/servicesConverter.js";
import { convertType, type ExampleLookupMaps } from "./converters/typeConverter.js";
import { constructEndpointSecurity, constructSecuritySchemes } from "./security.js";

function buildExampleLookupMaps(ir: IntermediateRepresentation): ExampleLookupMaps {
    const requestExamplesByTypeId = new Map<string, ExampleRequestBody>();
    const responseExamplesByTypeId = new Map<string, ExampleEndpointSuccessResponse>();

    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (endpoint.userSpecifiedExamples.length <= 0) {
                continue;
            }
            if (
                endpoint.requestBody?.type === "reference" &&
                endpoint.requestBody.requestBodyType.type === "named" &&
                !requestExamplesByTypeId.has(endpoint.requestBody.requestBodyType.typeId)
            ) {
                const example = endpoint.userSpecifiedExamples[0]?.example?.request;
                if (example != null) {
                    requestExamplesByTypeId.set(endpoint.requestBody.requestBodyType.typeId, example);
                }
            }
            if (
                endpoint.response?.body?.type === "json" &&
                endpoint.response.body.value.responseBodyType.type === "named" &&
                !responseExamplesByTypeId.has(endpoint.response.body.value.responseBodyType.typeId)
            ) {
                const okResponseExample = endpoint.userSpecifiedExamples.find(
                    (ex) => ex.example?.response.type === "ok"
                );
                if (okResponseExample?.example?.response.type === "ok") {
                    responseExamplesByTypeId.set(
                        endpoint.response.body.value.responseBodyType.typeId,
                        okResponseExample.example.response.value
                    );
                }
            }
        }
    }

    return { requestExamplesByTypeId, responseExamplesByTypeId };
}

export function convertIrToOpenApi({
    apiName,
    ir
}: {
    apiName: string;
    ir: IntermediateRepresentation;
}): OpenAPIV3.Document {
    const schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};
    const exampleLookup = buildExampleLookupMaps(ir);

    const typesByName: Record<string, TypeDeclaration> = {};
    Object.values(ir.types).forEach((typeDeclaration) => {
        const convertedType = convertType(typeDeclaration, exampleLookup);
        schemas[convertedType.schemaName] = {
            title: convertedType.schemaName,
            ...convertedType.openApiSchema
        };
        typesByName[getDeclaredNameKey(typeDeclaration.name)] = typeDeclaration;
    });

    const errorsByName: Record<string, ErrorDeclaration> = {};
    Object.values(ir.errors).forEach((errorDeclaration) => {
        errorsByName[getDeclaredNameKey(errorDeclaration.name)] = errorDeclaration;
    });

    const security = constructEndpointSecurity(ir.auth);

    const paths = convertServices({
        ir,
        httpServices: Object.values(ir.services),
        typesByName,
        errorsByName,
        errorDiscriminationStrategy: ir.errorDiscriminationStrategy,
        security,
        environments: ir.environments ?? undefined
    });

    const info: OpenAPIV3.InfoObject = {
        title: ir.apiDisplayName ?? apiName,
        version: ""
    };
    if (ir.apiDocs != null) {
        info.description = ir.apiDocs;
    }

    const openAPISpec: OpenAPIV3.Document = {
        openapi: "3.0.1",
        info,
        paths,
        components: {
            schemas,
            securitySchemes: constructSecuritySchemes(ir.auth)
        }
    };

    if (ir.environments != null && ir.environments.environments.type === "singleBaseUrl") {
        openAPISpec.servers = ir.environments.environments.environments.map((environment) => {
            return {
                url: environment.url,
                description:
                    environment.docs != null
                        ? `${environment.name.originalName} (${environment.docs})`
                        : environment.name.originalName
            };
        });
    }

    return openAPISpec;
}

export function getDeclaredNameKey(declared: { fernFilepath: FernFilepath; name: Name }): string {
    return [...declared.fernFilepath.allParts.map((part) => part.originalName), declared.name.originalName].join("-");
}
