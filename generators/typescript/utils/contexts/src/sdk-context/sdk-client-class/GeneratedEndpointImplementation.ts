import { GetReferenceOpts } from "@fern-typescript/commons";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { ExampleEndpointCall, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkContext } from "../SdkContext";

export namespace GeneratedEndpointImplementation {
    export interface Docs {
        getter: string | undefined;
        mainMethod: string | undefined;
        withRawResponseMethod: string | undefined;
    }

    export interface EndpointSignatures {
        mainMethod: EndpointSignature;
        withRawResponseMethod: EndpointSignature;
    }

    export interface EndpointSignature {
        parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
        returnTypeWithoutPromise: ts.TypeNode;
    }
}

export interface GeneratedEndpointImplementation {
    endpoint: HttpEndpoint;
    getStatements: (context: SdkContext) => ts.Statement[];
    getOverloads: (context: SdkContext) => GeneratedEndpointImplementation.EndpointSignatures[];
    getSignature: (context: SdkContext) => GeneratedEndpointImplementation.EndpointSignatures;
    getDocs: (context: SdkContext) => GeneratedEndpointImplementation.Docs;
    getExample: (args: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }) => ts.Expression | undefined;
    maybeLeverageInvocation: (args: { invocation: ts.Expression; context: SdkContext }) => ts.Node[] | undefined;
    isPaginated: (context: SdkContext) => boolean;
}
