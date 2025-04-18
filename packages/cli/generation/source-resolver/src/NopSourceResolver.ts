import { RawSchemas } from "@fern-api/fern-definition-schema";

import { ResolvedSource } from "./ResolvedSource";
import { SourceResolver } from "./SourceResolver";

export class NopSourceResolver implements SourceResolver {
    public resolveSource({ source }: { source: RawSchemas.SourceSchema }): ResolvedSource | undefined {
        return undefined;
    }

    public resolveSourceOrThrow({ source }: { source: RawSchemas.SourceSchema }): ResolvedSource | undefined {
        return undefined;
    }
}
