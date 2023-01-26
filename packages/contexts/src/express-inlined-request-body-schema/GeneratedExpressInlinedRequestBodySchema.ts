import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { ExpressInlinedRequestBodySchemaContext } from "./ExpressInlinedRequestBodySchemaContext";

export interface GeneratedExpressInlinedRequestBodySchema
    extends GeneratedFile<ExpressInlinedRequestBodySchemaContext> {
    deserializeRequest: (
        referenceToRawRequest: ts.Expression,
        context: ExpressInlinedRequestBodySchemaContext
    ) => ts.Expression;
}
