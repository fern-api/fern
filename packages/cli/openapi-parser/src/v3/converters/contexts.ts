import { EndpointSdkName, HttpMethod } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIV3 } from "openapi-types";

export interface OpenAPIDocumentContext {
    document: OpenAPIV3.Document;
}

export interface PathItemContext extends OpenAPIDocumentContext {
    method: HttpMethod;
    path: string;
    pathItemParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
    pathItem: OpenAPIV3.PathItemObject;
}

export interface OperationContext extends PathItemContext {
    sdkMethodName: EndpointSdkName | undefined;
    baseBreadcrumbs: string[];
    operationParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
    operation: OpenAPIV3.OperationObject;
}
