import { EndpointId, ExampleEndpointCall } from "@fern-fern/ir-sdk/api";
import { NpmPackage } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { SdkContext } from "..";
import { GeneratedFile } from "../../commons/GeneratedFile";

export interface GeneratedSdkClientClass extends GeneratedFile<SdkContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
    accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.PropertyAccessExpression;
    instantiateAsRoot(args: { context: SdkContext; npmPackage?: NpmPackage | undefined }): ts.Expression;
    invokeEndpoint(args: {
        context: SdkContext;
        endpointId: EndpointId;
        example: ExampleEndpointCall;
        clientReference: ts.Identifier;
    }): ts.Expression | undefined;
}
