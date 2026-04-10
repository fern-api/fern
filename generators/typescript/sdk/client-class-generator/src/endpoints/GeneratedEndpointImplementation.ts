import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { GeneratedEndpointResponse } from "./default/endpoint-response/GeneratedEndpointResponse.js";

export interface EndpointSignature {
    parameters: OptionalKind<ParameterDeclarationStructure>[];
    returnTypeWithoutPromise: ts.TypeNode;
}

export interface GeneratedEndpointImplementation {
    endpoint: FernIr.HttpEndpoint;
    response: GeneratedEndpointResponse;
    getStatements: (context: FileContext) => ts.Statement[];
    getOverloads: (context: FileContext) => EndpointSignature[];
    getSignature: (context: FileContext) => EndpointSignature;
    getDocs: (context: FileContext) => string | undefined;
    getExample: (args: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }) => ts.Expression | undefined;

    maybeLeverageInvocation: (args: { context: FileContext; invocation: ts.Expression }) => ts.Node[] | undefined;
}
