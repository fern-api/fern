import { Zurg } from "@fern-typescript/commons";
import { SdkEndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface GeneratedEndpointErrorSchema {
    writeToFile(context: SdkEndpointTypeSchemasContext): void;
    getReferenceToRawShape(context: SdkEndpointTypeSchemasContext): ts.TypeNode;
    getReferenceToZurgSchema(context: SdkEndpointTypeSchemasContext): Zurg.Schema;
}
