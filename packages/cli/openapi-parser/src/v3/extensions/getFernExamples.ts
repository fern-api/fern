import { EndpointExample } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export function getFernExamples(operationObject: OpenAPIV3.OperationObject): EndpointExample[] {
    return getExtension<EndpointExample[]>(operationObject, FernOpenAPIExtension.EXAMPLES) ?? [];
}
