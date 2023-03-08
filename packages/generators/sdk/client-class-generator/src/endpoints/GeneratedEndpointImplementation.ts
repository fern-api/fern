import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface EndpointSignature {
    parameters: OptionalKind<ParameterDeclarationStructure>[];
    returnTypeWithoutPromise: ts.TypeNode;
}

export interface GeneratedEndpointImplementation {
    endpoint: HttpEndpoint;
    getStatements: (context: SdkClientClassContext) => ts.Statement[];
    getOverloads: (context: SdkClientClassContext) => EndpointSignature[];
    getSignature: (
        context: SdkClientClassContext,
        opts?: { requestBodyIntersection?: ts.TypeNode }
    ) => EndpointSignature;
    getDocs: (context: SdkClientClassContext) => string | undefined;
}
