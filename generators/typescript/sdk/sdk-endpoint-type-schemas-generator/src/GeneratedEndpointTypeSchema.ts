import { Zurg } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";

export interface GeneratedEndpointTypeSchema {
    writeSchemaToFile: (context: SdkContext) => void;
    getReferenceToZurgSchema: (context: SdkContext) => Zurg.Schema;
}
