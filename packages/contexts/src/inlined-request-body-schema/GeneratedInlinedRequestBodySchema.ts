import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { InlinedRequestBodySchemaContext } from "./InlinedRequestBodySchemaContext";

export interface GeneratedInlinedRequestBodySchema extends GeneratedFile<InlinedRequestBodySchemaContext> {
    serializeRequest: (
        referenceToParsedRequest: ts.Expression,
        context: InlinedRequestBodySchemaContext
    ) => ts.Expression;
}
