import { Zurg } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";

export interface GeneratedEndpointTypeSchema {
    writeSchemaToFile: (context: FileContext) => void;
    getReferenceToZurgSchema: (context: FileContext) => Zurg.Schema;
}
