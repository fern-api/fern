import { Zurg } from "@fern-typescript/commons";
import { SdkEndpointTypeSchemasContext } from "@fern-typescript/contexts";

export interface GeneratedEndpointTypeSchema {
    writeSchemaToFile: (context: SdkEndpointTypeSchemasContext) => void;
    getReferenceToZurgSchema: (context: SdkEndpointTypeSchemasContext) => Zurg.Schema;
}
