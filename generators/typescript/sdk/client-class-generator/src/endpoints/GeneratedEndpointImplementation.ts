import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { GeneratedEndpointResponse } from "./default/endpoint-response/GeneratedEndpointResponse.js";

export interface EndpointSignature {
    parameters: OptionalKind<ParameterDeclarationStructure>[];
    returnTypeWithoutPromise: ts.TypeNode;
}

export interface GeneratedEndpointImplementation {
    endpoint: FernIr.HttpEndpoint;
    response: GeneratedEndpointResponse;
    getStatements: (context: SdkContext) => ts.Statement[];
    getOverloads: (context: SdkContext) => EndpointSignature[];
    getSignature: (context: SdkContext) => EndpointSignature;
    getDocs: (context: SdkContext) => string | undefined;
    getExample: (args: {
        context: SdkContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }) => ts.Expression | undefined;

    maybeLeverageInvocation: (args: { context: SdkContext; invocation: ts.Expression }) => ts.Node[] | undefined;
}
