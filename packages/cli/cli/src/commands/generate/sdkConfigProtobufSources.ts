import { CliError } from "@fern-api/task-context";
import type { SdkConfigV1, SdkConfigV1ProtobufSource, SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";

/** An SDK Config source that points at protobuf definitions (`proto:`) instead of a spec path or URL. */
export type SdkConfigV1ProtobufSourceSpec = Extract<SdkConfigV1SourceSpec, { proto: SdkConfigV1ProtobufSource }>;

export function isProtobufSource(spec: SdkConfigV1SourceSpec): spec is SdkConfigV1ProtobufSourceSpec {
    return "proto" in spec;
}

/**
 * ponytail: hosted SDK Config generation would pack raw .proto directories, which sdk-gen-api rejects. SDK-2212
 * converts protobuf sources to OpenAPI before sending them; remove this guard there.
 */
export function assertNoHostedProtobufSources(config: SdkConfigV1): void {
    const ids = config.source.specs.filter(isProtobufSource).map((spec) => `'${spec.id}'`);
    if (ids.length === 0) {
        return;
    }
    throw new CliError({
        message: `SDK Config protobuf source${ids.length === 1 ? "" : "s"} ${ids.join(", ")} ${ids.length === 1 ? "is" : "are"} not supported for hosted generation yet. Run with --local to generate from ${ids.length === 1 ? "it" : "them"}.`,
        code: CliError.Code.ConfigError
    });
}
