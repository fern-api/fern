import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertEndpoint } from "./convertEndpoint";
import { IrBuilder } from "./IrBuilder";

export function convertPathItemObject({
    path,
    document,
    pathItemObject,
    irBuilder,
}: {
    path: string;
    document: OpenAPIV3.Document;
    pathItemObject: OpenAPIV3.PathItemObject;
    irBuilder: IrBuilder;
}): void {
    if (pathItemObject.get != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Get,
            operationObject: pathItemObject.get,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.post != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Post,
            operationObject: pathItemObject.post,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.put != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Put,
            operationObject: pathItemObject.put,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.patch != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Patch,
            operationObject: pathItemObject.patch,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
    if (pathItemObject.delete != null) {
        const convertedEndpoint = convertEndpoint({
            path,
            document,
            httpMethod: FernOpenapiIr.HttpMethod.Delete,
            operationObject: pathItemObject.delete,
        });
        irBuilder.addEndpoint(convertedEndpoint.endpoint);
    }
}
