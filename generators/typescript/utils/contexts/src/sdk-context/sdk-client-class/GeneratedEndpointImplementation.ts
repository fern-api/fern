import { GetReferenceOpts } from "@fern-typescript/commons";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { ExampleEndpointCall, HttpEndpoint } from "@fern-fern/ir-sdk";

import { SdkContext } from "../SdkContext";
import { EndpointSampleCode } from "../../commons/EndpointSampleCode";

export namespace GeneratedEndpointImplementation {
    export interface EndpointSignature {
        parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
        returnTypeWithoutPromise: ts.TypeNode;
    }
}

export interface GeneratedEndpointImplementation {
    endpoint: HttpEndpoint;
    getStatements: (context: SdkContext) => ts.Statement[];
    getOverloads: (context: SdkContext) => GeneratedEndpointImplementation.EndpointSignature[];
    getSignature: (context: SdkContext) => GeneratedEndpointImplementation.EndpointSignature;
    getDocs: (context: SdkContext) => string | undefined;
    getExample: (args: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }) => EndpointSampleCode | undefined;
    maybeLeverageInvocation: (args: { invocation: ts.Expression; context: SdkContext }) => ts.Node[] | undefined;
    isPaginated: (context: SdkContext) => boolean;
}
