import { OpenAPIV3 } from "openapi-types";

import { EndpointSdkName, HttpMethod, Pagination } from "@fern-api/openapi-ir";

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
    pagination: Pagination | undefined;
}
