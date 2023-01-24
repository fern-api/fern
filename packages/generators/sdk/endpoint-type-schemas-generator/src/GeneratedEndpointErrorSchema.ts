import { Zurg } from "@fern-typescript/commons";
import { EndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface GeneratedEndpointErrorSchema {
    writeToFile(context: EndpointTypeSchemasContext): void;
    getReferenceToRawShape(context: EndpointTypeSchemasContext): ts.TypeNode;
    getReferenceToZurgSchema(context: EndpointTypeSchemasContext): Zurg.Schema;
}
