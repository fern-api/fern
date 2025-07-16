import { RawSchemas } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { ResolvedSource } from "./ResolvedSource";

export interface SourceResolver {
    resolveSource: (args: { source: RawSchemas.SourceSchema }) => ResolvedSource | undefined;
    resolveSourceOrThrow: (args: {
        source: RawSchemas.SourceSchema;
        relativeFilepath: RelativeFilePath;
    }) => ResolvedSource | undefined;
}
