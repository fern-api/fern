import { CliError } from "@fern-api/task-context";
import type { SdkConfigV1, SdkConfigV1ProtobufSource, SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";

/** An SDK Config source that points at protobuf definitions (`proto:`) instead of a spec path or URL. */
export type SdkConfigV1ProtobufSourceSpec = Extract<SdkConfigV1SourceSpec, { proto: SdkConfigV1ProtobufSource }>;

export function isProtobufSource(spec: SdkConfigV1SourceSpec): spec is SdkConfigV1ProtobufSourceSpec {
    return "proto" in spec;
}

/**
 * ponytail: `--local` runs the on-prem adapter, which reads sdk-config.yml directly and accepts only OpenAPI
 * and AsyncAPI. Hosted generation converts protobuf sources to OpenAPI before upload; SDK-2213 reuses that
 * conversion for --local and removes this guard. `fern check` still loads them.
 */
export function assertNoProtobufSourcesForLocalGeneration(config: SdkConfigV1): void {
    const ids = config.source.specs.filter(isProtobufSource).map((spec) => `'${spec.id}'`);
    if (ids.length === 0) {
        return;
    }
    throw new CliError({
        message: `SDK Config protobuf source${ids.length === 1 ? "" : "s"} ${ids.join(", ")} cannot be generated with --local yet. Remove --local to generate them remotely, or convert the protos to OpenAPI and use a path source.`,
        code: CliError.Code.ConfigError
    });
}
