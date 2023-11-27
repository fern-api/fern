import { HttpMethod } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { PathItemContext } from "./contexts";
import { ConvertedOperation, convertOperation } from "./operation/convertOperation";

export function convertPathItem(
    path: string,
    pathItemObject: OpenAPIV3.PathItemObject,
    document: OpenAPIV3.Document,
    context: AbstractOpenAPIV3ParserContext
): ConvertedOperation[] {
    const result: ConvertedOperation[] = [];
    const operations = getOperationObjectsFromPathItem(pathItemObject);

    const basePathItemContext: Omit<PathItemContext, "method"> = {
        document,
        pathItem: pathItemObject,
        path,
        pathItemParameters: pathItemObject.parameters ?? []
    };

    for (const operation of operations) {
        const convertedOperation = convertOperation({
            context,
            pathItemContext: {
                ...basePathItemContext,
                method: operation.method
            },
            operation: operation.operation
        });
        if (convertedOperation != null) {
            result.push(convertedOperation);
        }
    }
    return result;
}

function getOperationObjectsFromPathItem(
    pathItemObject: OpenAPIV3.PathItemObject
): { method: HttpMethod; operation: OpenAPIV3.OperationObject }[] {
    const operations = [];

    if (pathItemObject.get != null) {
        operations.push({
            method: HttpMethod.Get,
            operation: pathItemObject.get
        });
    }

    if (pathItemObject.post != null) {
        operations.push({
            method: HttpMethod.Post,
            operation: pathItemObject.post
        });
    }

    if (pathItemObject.put != null) {
        operations.push({
            method: HttpMethod.Put,
            operation: pathItemObject.put
        });
    }

    if (pathItemObject.delete != null) {
        operations.push({
            method: HttpMethod.Delete,
            operation: pathItemObject.delete
        });
    }

    if (pathItemObject.patch != null) {
        operations.push({
            method: HttpMethod.Patch,
            operation: pathItemObject.patch
        });
    }

    return operations;
}
