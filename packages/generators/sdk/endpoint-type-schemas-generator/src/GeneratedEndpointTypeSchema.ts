import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext } from "@fern-typescript/contexts";

export interface GeneratedEndpointTypeSchema {
    writeSchemaToFile: (context: EndpointTypeSchemasContext) => void;
    getReferenceToZurgSchema: (context: EndpointTypeSchemasContext) => Zurg.Schema;
}
