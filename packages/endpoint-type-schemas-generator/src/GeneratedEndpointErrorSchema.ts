import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";

export interface GeneratedEndpointErrorSchema {
    writeToFile(context: EndpointTypeSchemasContext): void;
    getReferenceToRawShape(context: EndpointTypeSchemasContext): ts.TypeNode;
    getReferenceToZurgSchema(context: EndpointTypeSchemasContext): Zurg.Schema;
}
