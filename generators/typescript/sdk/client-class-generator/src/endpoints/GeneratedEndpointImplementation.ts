import { ExampleEndpointCall, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface EndpointSignature {
    parameters: OptionalKind<ParameterDeclarationStructure>[];
    returnTypeWithoutPromise: ts.TypeNode;
}

export interface GeneratedEndpointImplementation {
    endpoint: HttpEndpoint;
    getStatements: (context: SdkContext) => ts.Statement[];
    getOverloads: (context: SdkContext) => EndpointSignature[];
    getSignature: (context: SdkContext) => EndpointSignature;
    getDocs: (context: SdkContext) => string | undefined;
    getExample: (args: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }) => ts.Expression | undefined;
}
