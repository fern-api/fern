import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ResolvedSource } from "./ResolvedSource";
import { RelativeFilePath } from "@fern-api/path-utils";

export interface SourceResolver {
    resolveSource: (args: { source: RawSchemas.SourceSchema }) => Promise<ResolvedSource | undefined>;
    resolveSourceOrThrow: (args: {
        source: RawSchemas.SourceSchema;
        relativeFilepath: RelativeFilePath;
    }) => Promise<ResolvedSource | undefined>;
}
