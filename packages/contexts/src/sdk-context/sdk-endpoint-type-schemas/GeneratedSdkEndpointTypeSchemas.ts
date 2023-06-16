import { ts } from "ts-morph";
import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";

export interface GeneratedSdkEndpointTypeSchemas extends GeneratedFile<SdkContext> {
    getReferenceToRawResponse: (context: SdkContext) => ts.TypeNode;
    getReferenceToRawError: (context: SdkContext) => ts.TypeNode;
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: SdkContext) => ts.Expression;
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: SdkContext) => ts.Expression;
    deserializeError: (referenceToRawError: ts.Expression, context: SdkContext) => ts.Expression;
    deserializeStreamDataAndVisitMaybeValid(args: {
        referenceToRawStreamData: ts.Expression;
        context: SdkContext;
        visitValid: (referenceToValue: ts.Expression) => ts.Statement[];
        visitInvalid: (referenceToErrors: ts.Expression) => ts.Statement[];
        parsedDataVariableName: string;
    }): ts.Statement[];
}
