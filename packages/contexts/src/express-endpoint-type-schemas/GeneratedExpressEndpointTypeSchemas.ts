import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { ExpressEndpointTypeSchemasContext } from "./ExpressEndpointTypeSchemasContext";

export interface GeneratedExpressEndpointTypeSchemas extends GeneratedFile<ExpressEndpointTypeSchemasContext> {
    getReferenceToRawResponse: (context: ExpressEndpointTypeSchemasContext) => ts.TypeNode;
    deserializeRequest: (
        referenceToRawRequest: ts.Expression,
        context: ExpressEndpointTypeSchemasContext
    ) => ts.Expression;
    serializeResponse: (
        referenceToParsedResponse: ts.Expression,
        context: ExpressEndpointTypeSchemasContext
    ) => ts.Expression;
}
