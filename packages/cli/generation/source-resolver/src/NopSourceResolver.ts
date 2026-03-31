import { RawSchemas } from "@fern-api/fern-definition-schema";

import { ResolvedSource } from "./ResolvedSource.js";
import { SourceResolver } from "./SourceResolver.js";

export class NopSourceResolver implements SourceResolver {
    public resolveSource({ source }: { source: RawSchemas.SourceSchema }): ResolvedSource | undefined {
        return undefined;
    }

    public resolveSourceOrThrow({ source }: { source: RawSchemas.SourceSchema }): ResolvedSource | undefined {
        return undefined;
    }
}
