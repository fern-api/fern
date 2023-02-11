import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { resolveParameterReference } from "./resolvers";
import { isReferenceObject } from "./utils";

export interface ConvertedEndpoint {
    endpoint: FernOpenapiIr.Endpoint,
    referencedSchemas: FernOpenapiIr.SchemaId[],
}

export function convertEndpoint({
    path,
    httpMethod,
    operationObject,
}: {
    path: string;
    httpMethod: FernOpenapiIr.HttpMethod;
    operationObject: OpenAPIV3.OperationObject;
}): ConvertedEndpoint {
    const requestName = (operationObject as any)["x-request-name"] as string | undefined;
    return {
        endpoint: {
            method: httpMethod, 
            operationId: operationObject.operationId,
            path,
            requestName,
            summary: operationObject.summary,
            tags: operationObject.tags ?? [],
            request: undefined,

            response: undefined,
        }
        referencedSchemas: [],
    }
}

interface ConvertedParameters {
    queryParameters: FernOpenapiIr.QueryParameter[],
    pathParameters: FernOpenapiIr.PathParameter[],
}

function convertParameters({ document, operationObject}: { document: OpenAPIV3.Document, operationObject: OpenAPIV3.OperationObject}) {
    const convertedParameters = {
        queryParameters: [],
        pathParameters: [],
    }
    for (const parameterObject of operationObject.parameters ?? []) {
        const resolvedParameterObject = isReferenceObject(parameterObject)
            ? resolveParameterReference({ parameter: parameterObject, document })
            : parameterObject;
        if (resolvedParameterObject == null) {
            continue;
        }
        let parameterSchema = resolvedParameterObject.schema != null 
            ? FernOpenapiIr.Schema.primitive(FernOpenapiIr.PrimitiveSchema.string())
            ? convertParameterSchema()

        if (resolvedParameterObject.in === "query") {
            
        } else if (resolvedParameterObject.in === "path") {

        }
    }
}
