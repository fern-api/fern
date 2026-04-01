import { FernIr } from "@fern-fern/ir-sdk";
import { NpmPackage } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { EndpointSampleCode } from "../../commons/index.js";
import { FileContext } from "../index.js";
import { GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation.js";

export interface GeneratedSdkClientClass extends GeneratedFile<FileContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
    accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression;
    instantiateAsRoot(args: { context: FileContext; npmPackage?: NpmPackage | undefined }): ts.Expression;
    invokeEndpoint(args: {
        context: FileContext;
        endpointId: FernIr.EndpointId;
        example: FernIr.ExampleEndpointCall;
        clientReference: ts.Identifier;
    }): EndpointSampleCode | undefined;

    getEndpoint(args: { context: FileContext; endpointId: string }): GeneratedEndpointImplementation | undefined;

    maybeLeverageInvocation: (args: {
        context: FileContext;
        endpointId: FernIr.EndpointId;
        example: FernIr.ExampleEndpointCall;
        clientReference: ts.Identifier;
    }) => ts.Node[] | undefined;

    hasAnyEndpointsWithAuth: () => boolean;
    hasAuthProvider: () => boolean;
    getReferenceToAuthProvider: () => ts.Expression | undefined;
    getReferenceToAuthProviderOrThrow: () => ts.Expression;
}
