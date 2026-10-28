import { type SdkConfigIrV1, serializeSdkConfigIrV1 } from "@postman/sdk-config";

export function serializeSdkConfigIrForGenerator(sdkConfigIr: SdkConfigIrV1): Uint8Array {
    return serializeSdkConfigIrV1(sdkConfigIr).body;
}
