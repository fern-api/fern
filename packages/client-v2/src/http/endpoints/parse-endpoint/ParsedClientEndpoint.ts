import { HttpMethod, HttpPath } from "@fern-fern/ir-model/services/http";
import { TypeReferenceNode } from "@fern-typescript/declaration-handler";
import { ts } from "ts-morph";
import { RequestWrapper } from "./constructRequestWrapper";

export interface ParsedClientEndpoint {
    endpointMethodName: string;
    path: HttpPath;
    method: HttpMethod;
    request: ClientEndpointRequest | undefined;
    referenceToResponse: TypeReferenceNode | undefined;
    error: ClientEndpointError;
}

export type ClientEndpointRequest = ClientEndpointRequest.Wrapped | ClientEndpointRequest.NotWrapped;

export declare namespace ClientEndpointRequest {
    export interface Wrapped extends Base, RequestWrapper {
        isWrapped: true;
    }

    export interface NotWrapped extends Base {
        isWrapped: false;
        referenceToBody: TypeReferenceNode;
    }

    export interface Base {}
}

export interface ClientEndpointError {
    reference: ts.TypeNode;
    generateConstructNetworkErrorBody: () => ts.Expression;
    generateConstructServerErrorStatements: () => ts.Statement;
}
