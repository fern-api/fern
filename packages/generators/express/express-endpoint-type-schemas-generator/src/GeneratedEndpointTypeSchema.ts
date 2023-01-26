import { Zurg } from "@fern-typescript/commons";
import { ExpressEndpointTypeSchemasContext } from "@fern-typescript/contexts";

export interface GeneratedEndpointTypeSchema {
    writeSchemaToFile: (context: ExpressEndpointTypeSchemasContext) => void;
    getReferenceToZurgSchema: (context: ExpressEndpointTypeSchemasContext) => Zurg.Schema;
}
