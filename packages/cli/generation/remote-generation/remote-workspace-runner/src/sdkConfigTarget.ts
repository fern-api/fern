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

export function createSdkConfigTargetPayload(target: FernSdkConfigV1Payload["targets"][number]): FernSdkGenApiPayload {
    return {
        payloadKind: "sdk-config-v1",
        body: target.body,
        ...(target.package == null ? {} : { package: target.package })
    };
}
