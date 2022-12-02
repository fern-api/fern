import { ts } from "ts-morph";
import { EndpointTypeSchemasContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedEndpointTypeSchemas extends BaseGenerated<EndpointTypeSchemasContext> {
    getReferenceToRawResponse: (context: EndpointTypeSchemasContext) => ts.TypeNode;
    getReferenceToRawError: (context: EndpointTypeSchemasContext) => ts.TypeNode;
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: EndpointTypeSchemasContext) => ts.Expression;
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: EndpointTypeSchemasContext) => ts.Expression;
    deserializeError: (referenceToRawError: ts.Expression, context: EndpointTypeSchemasContext) => ts.Expression;
}
