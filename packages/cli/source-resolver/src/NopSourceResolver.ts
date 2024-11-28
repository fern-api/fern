import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ResolvedSource } from "./ResolvedSource";
import { SourceResolver } from "./SourceResolver";
export class NopSourceResolver implements SourceResolver {
    public async resolveSource({ source }: { source: RawSchemas.SourceSchema }): Promise<ResolvedSource | undefined> {
        return undefined;
    }

    public async resolveSourceOrThrow({
        source
    }: {
        source: RawSchemas.SourceSchema;
    }): Promise<ResolvedSource | undefined> {
        return undefined;
    }
}
