import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface PaginationResponseInfo {
    responseType: ts.TypeNode;
    itemType: ts.TypeNode;
    getItems: ts.Expression;
    hasNextPage: ts.Expression;
    loadPage: ts.Expression;
}

export interface GeneratedEndpointResponse {
    getPaginationInfo: (context: SdkContext) => PaginationResponseInfo | undefined;
    getResponseVariableName: () => string;
    getReturnResponseStatements: (context: SdkContext) => ts.Statement[];
    getReturnType: (context: SdkContext) => ts.TypeNode;
    getNamesOfThrownExceptions: (context: SdkContext) => string[];
}
