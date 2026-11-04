import { isRecord } from "@fern-api/core-utils";
import type { SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";

import type { FernSdkConfigV1Payload, FernSdkGenApiPayload } from "./fernSdkGenApi.js";

export function resolveSdkConfigTarget(
    sdkConfigV1: FernSdkConfigV1Payload | undefined,
    targetIdSeed: string | undefined
): FernSdkConfigV1Payload["targets"][number] | undefined {
    if (sdkConfigV1 == null || targetIdSeed == null) {
        return undefined;
    }
    const targetIndex = Number(targetIdSeed);
    return Number.isInteger(targetIndex) && targetIndex >= 0 ? sdkConfigV1.targets[targetIndex] : undefined;
}

/**
 * Builds a target's sdk-config-v1 payload. `sourceSpecs`, when the source archive rewrote them (for
 * example, protobuf converted to OpenAPI), replace the document's `source.specs` so they line up with
 * the uploaded manifest entries.
 */
export function createSdkConfigTargetPayload(
    target: FernSdkConfigV1Payload["targets"][number],
    sourceSpecs?: SdkConfigV1SourceSpec[]
): FernSdkGenApiPayload {
    return {
        payloadKind: "sdk-config-v1",
        body: sourceSpecs == null ? target.body : withSourceSpecs(target.body, sourceSpecs),
        ...(target.package == null ? {} : { package: target.package })
    };
}

function withSourceSpecs(body: Buffer, specs: SdkConfigV1SourceSpec[]): Buffer {
    const document: unknown = JSON.parse(body.toString("utf8"));
    if (!isRecord(document) || !isRecord(document.source)) {
        throw new Error("SDK Config v1 target payload has no source");
    }
    return Buffer.from(`${JSON.stringify({ ...document, source: { ...document.source, specs } })}\n`);
}
