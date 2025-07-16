import { Zurg } from "@fern-typescript/commons"
import { ExpressContext } from "@fern-typescript/contexts"

export interface GeneratedEndpointTypeSchema {
    writeSchemaToFile: (context: ExpressContext) => void
    getReferenceToZurgSchema: (context: ExpressContext) => Zurg.Schema
}
