import { CliError } from "@fern-api/task-context";
import type { SdkConfigV1, SdkConfigV1ProtobufSource, SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";

/** An SDK Config source that points at protobuf definitions (`proto:`) instead of a spec path or URL. */
export type SdkConfigV1ProtobufSourceSpec = Extract<SdkConfigV1SourceSpec, { proto: SdkConfigV1ProtobufSource }>;

export function isProtobufSource(spec: SdkConfigV1SourceSpec): spec is SdkConfigV1ProtobufSourceSpec {
    return "proto" in spec;
}

/**
 * ponytail: no SDK Config generation route can consume protobuf yet. The hosted route would upload raw .proto
 * directories, which sdk-gen-api rejects; the --local Postman adapter accepts only OpenAPI and AsyncAPI. SDK-2212
 * converts protobuf sources to OpenAPI first; remove this guard there. `fern check` still loads them.
 */
export function assertNoProtobufSourcesForGeneration(config: SdkConfigV1): void {
    const ids = config.source.specs.filter(isProtobufSource).map((spec) => `'${spec.id}'`);
    if (ids.length === 0) {
        return;
    }
    throw new CliError({
        message: `SDK Config protobuf source${ids.length === 1 ? "" : "s"} ${ids.join(", ")} cannot be generated from yet: SDK Config generation does not convert protobuf to OpenAPI. \`fern check\` validates protobuf sources; to generate now, convert the protos to OpenAPI and use a path source.`,
        code: CliError.Code.ConfigError
    });
}
