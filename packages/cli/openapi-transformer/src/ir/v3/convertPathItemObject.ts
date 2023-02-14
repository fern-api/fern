import { TaskContext } from "@fern-api/task-context";
import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertEndpoint } from "./convertEndpoint";
import { IrBuilder } from "./IrBuilder";

export function convertPathItemObject({
    path,
    document,
    pathItemObject,
    irBuilder,
    taskContext,
}: {
    path: string;
    document: OpenAPIV3.Document;
    pathItemObject: OpenAPIV3.PathItemObject;
    irBuilder: IrBuilder;
    taskContext: TaskContext;
}): void {
    if (pathItemObject.get != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Get,
            operationObject: pathItemObject.get,
            taskContext,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.post != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Post,
            operationObject: pathItemObject.post,
            taskContext,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.put != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Put,
            operationObject: pathItemObject.put,
            taskContext,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.patch != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Patch,
            operationObject: pathItemObject.patch,
            taskContext,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.delete != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Delete,
            operationObject: pathItemObject.delete,
            taskContext,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
}
