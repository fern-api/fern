import { EndpointId, ExampleEndpointCall } from "@fern-fern/ir-sdk/api";
import { ts } from "ts-morph";
import { SdkContext } from "..";
import { GeneratedFile } from "../../commons/GeneratedFile";

export interface GeneratedSdkClientClass extends GeneratedFile<SdkContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
    accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.PropertyAccessExpression;
    getSnippetForEndpoint(args: {
        context: SdkContext;
        endpointId: EndpointId;
        example: ExampleEndpointCall;
    }): ts.Expression | undefined;
}
