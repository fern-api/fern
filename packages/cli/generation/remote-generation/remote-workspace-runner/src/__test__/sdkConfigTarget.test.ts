import type { FernSdkConfigV1Payload } from "../fernSdkGenApi.js";
import { createSdkConfigTargetPayload, resolveSdkConfigTarget } from "../sdkConfigTarget.js";

describe("resolveSdkConfigTarget", () => {
    it("selects distinct duplicate-language payload bodies by preserved target index", () => {
        const firstBody = Buffer.from('{"sdkName":"first","targets":[{"language":"typescript"}]}');
        const secondBody = Buffer.from('{"sdkName":"second","targets":[{"language":"typescript"}]}');
        const sdkConfigV1: FernSdkConfigV1Payload = {
            sdkName: "root",
            sdkVersion: "1.2.3",
            targets: [
                { body: firstBody, language: "typescript" },
                { body: secondBody, language: "typescript" }
            ]
        };

        const first = resolveSdkConfigTarget(sdkConfigV1, "0");
        const second = resolveSdkConfigTarget(sdkConfigV1, "1");
        expect(first?.body).toBe(firstBody);
        expect(second?.body).toBe(secondBody);
        if (first == null || second == null) {
            throw new Error("Expected both SDK Config targets");
        }
        expect(createSdkConfigTargetPayload(first)).toEqual({ payloadKind: "sdk-config-v1", body: firstBody });
        expect(createSdkConfigTargetPayload(second)).toEqual({ payloadKind: "sdk-config-v1", body: secondBody });
    });
});
