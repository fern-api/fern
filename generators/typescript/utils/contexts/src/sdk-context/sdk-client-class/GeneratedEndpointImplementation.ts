import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { OptionalKind, ParameterDeclarationStructure, TypeParameterDeclarationStructure, ts } from "ts-morph";
import { EndpointSampleCode } from "../../commons/EndpointSampleCode.js";
import { FileContext } from "../file-context/FileContext.js";

export namespace GeneratedEndpointImplementation {
    export interface EndpointSignature {
        parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
        returnTypeWithoutPromise: ts.TypeNode;
        /**
         * Method-level type parameters, e.g. `<S extends UserSelect>` for GraphQL operations whose
         * result type is inferred from the caller's selection. Omitted for ordinary endpoints.
         */
        typeParameters?: OptionalKind<TypeParameterDeclarationStructure>[];
    }
}

export interface GeneratedEndpointImplementation {
    endpoint: FernIr.HttpEndpoint;
    getStatements: (context: FileContext) => ts.Statement[];
    getOverloads: (context: FileContext) => GeneratedEndpointImplementation.EndpointSignature[];
    getSignature: (context: FileContext) => GeneratedEndpointImplementation.EndpointSignature;
    getDocs: (context: FileContext) => string | undefined;
    getExample: (args: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }) => EndpointSampleCode | undefined;
    maybeLeverageInvocation: (args: { invocation: ts.Expression; context: FileContext }) => ts.Node[] | undefined;
    isPaginated: (context: FileContext) => boolean;
}
