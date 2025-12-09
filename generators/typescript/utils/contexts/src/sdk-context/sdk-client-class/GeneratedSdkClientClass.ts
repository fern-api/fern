import { EndpointId, ExampleEndpointCall } from "@fern-fern/ir-sdk/api";
import { NpmPackage } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { EndpointSampleCode } from "../../commons";
import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "..";
import { GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";

export interface GeneratedSdkClientClass extends GeneratedFile<SdkContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
    accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression;
    instantiateAsRoot(args: { context: SdkContext; npmPackage?: NpmPackage | undefined }): ts.Expression;
    invokeEndpoint(args: {
        context: SdkContext;
        endpointId: EndpointId;
        example: ExampleEndpointCall;
        clientReference: ts.Identifier;
    }): EndpointSampleCode | undefined;

    getEndpoint(args: { context: SdkContext; endpointId: string }): GeneratedEndpointImplementation | undefined;

    maybeLeverageInvocation: (args: {
        context: SdkContext;
        endpointId: EndpointId;
        example: ExampleEndpointCall;
        clientReference: ts.Identifier;
    }) => ts.Node[] | undefined;

    hasAnyEndpointsWithAuth: () => boolean;
    hasAuthProvider: () => boolean;
    getReferenceToAuthProvider: () => ts.Expression | undefined;
    getReferenceToAuthProviderOrThrow: () => ts.Expression;
}
