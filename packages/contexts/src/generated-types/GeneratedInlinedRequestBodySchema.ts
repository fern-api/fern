import { ts } from "ts-morph";
import { InlinedRequestBodySchemaContext } from "../contexts";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedInlinedRequestBodySchema extends GeneratedFile<InlinedRequestBodySchemaContext> {
    serializeRequest: (
        referenceToParsedRequest: ts.Expression,
        context: InlinedRequestBodySchemaContext
    ) => ts.Expression;
}
