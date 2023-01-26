import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { SdkInlinedRequestBodySchemaContext } from "./SdkInlinedRequestBodySchemaContext";

export interface GeneratedSdkInlinedRequestBodySchema extends GeneratedFile<SdkInlinedRequestBodySchemaContext> {
    serializeRequest: (
        referenceToParsedRequest: ts.Expression,
        context: SdkInlinedRequestBodySchemaContext
    ) => ts.Expression;
}
