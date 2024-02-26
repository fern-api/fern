import { EndpointExample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernExamples(operationObject: OpenAPIV3.OperationObject): EndpointExample[] {
    return getExtension<EndpointExample[]>(operationObject, FernOpenAPIExtension.EXAMPLES) ?? [];
}
