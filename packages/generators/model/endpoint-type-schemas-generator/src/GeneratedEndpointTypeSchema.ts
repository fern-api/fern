import { Zurg } from "@fern-typescript/commons";
import { EndpointTypeSchemasContext } from "@fern-typescript/contexts";

export interface GeneratedEndpointTypeSchema {
    writeSchemaToFile: (context: EndpointTypeSchemasContext) => void;
    getReferenceToZurgSchema: (context: EndpointTypeSchemasContext) => Zurg.Schema;
}
