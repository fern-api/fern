import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export type PaginationResponseInfo =
    | CursorPaginationResponseInfo
    | OffsetPaginationResponseInfo
    | CustomPaginationResponseInfo
    | UriOrPathPaginationResponseInfo;

export interface CursorPaginationResponseInfo {
    type: "cursor";
    responseType: ts.TypeNode;
    itemType: ts.TypeNode;
    getItems: ts.Expression;
    hasNextPage: ts.Expression;
    loadPage: ts.Statement[];
}

export interface OffsetPaginationResponseInfo {
    type: "offset" | "offset-step";
    initializeOffset: ts.Statement;
    responseType: ts.TypeNode;
    itemType: ts.TypeNode;
    getItems: ts.Expression;
    hasNextPage: ts.Expression;
    loadPage: ts.Statement[];
}

export interface CustomPaginationResponseInfo {
    type: "custom";
    responseType: ts.TypeNode;
    itemType: ts.TypeNode;
    getItems: ts.Expression;
    hasNextPage: ts.Expression;
    loadPage: ts.Statement[];
}

export interface UriOrPathPaginationResponseInfo {
    type: "uri" | "path";
    responseType: ts.TypeNode;
    itemType: ts.TypeNode;
    getItems: ts.Expression;
    hasNextPage: ts.Expression;
    loadPage: ts.Statement[];
}

export interface GeneratedEndpointResponse {
    getPaginationInfo: (context: FileContext) => PaginationResponseInfo | undefined;
    getResponseVariableName: () => string;
    getReturnResponseStatements: (context: FileContext) => ts.Statement[];
    getReturnType: (context: FileContext) => ts.TypeNode;
    getNamesOfThrownExceptions: (context: FileContext) => string[];
}
