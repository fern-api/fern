import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";

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
    queryParameters: FernOpenapiIr.QueryParameter,
    pathParameters: FernOpenapiIr.PathParameter,

}

function convertParameters(operationObject: OpenAPIV3.OperationObject) {

}
