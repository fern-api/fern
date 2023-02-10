import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertEndpoint } from "./convertEndpoint";

export function generateIrForOpenAPI(document: OpenAPIV3.Document): FernOpenapiIr.IntermediateRepresentation {
    const ir: FernOpenapiIr.IntermediateRepresentation = {
        environments: [],
        endpoints: [],
        schemas: {},
        schemasToTags: {},
    };

    Object.entries(document.paths).forEach(([path, pathDefinition]) => {
        if (pathDefinition?.get != null) {
            convertEndpoint({ path, httpMethod: FernOpenapiIr.HttpMethod.Get, operationObject: pathDefinition.get });
        }
        if (pathDefinition?.post != null) {
            convertEndpoint({ path, httpMethod: FernOpenapiIr.HttpMethod.Post, operationObject: pathDefinition.post });
        }

        if (pathDefinition?.put != null) {
            convertEndpoint({ path, httpMethod: FernOpenapiIr.HttpMethod.Put, operationObject: pathDefinition.put });
        }

        if (pathDefinition?.patch != null) {
            convertEndpoint({
                path,
                httpMethod: FernOpenapiIr.HttpMethod.Patch,
                operationObject: pathDefinition.patch,
            });
        }

        if (pathDefinition?.delete != null) {
            convertEndpoint({
                path,
                httpMethod: FernOpenapiIr.HttpMethod.Delete,
                pathItemObject: pathDefinition.delete,
            });
        }
    });
}

// Generate OpenAP IR

// Step 1: Loop over endpoints
// Step 2: Convert endpoints (ignore request ref and response ref)
// Step 3: Loop over schemas
// Step 4: Convert schemas
