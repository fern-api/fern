import { describe, expect, it } from "vitest";

import { getSdkVariableOptionNames } from "../sdkVariableOptionName.js";

describe("getSdkVariableOptionNames", () => {
    it("keeps non-colliding names as-is", () => {
        expect(getSdkVariableOptionNames(["targetAccountSid", "region"])).toEqual(["targetAccountSid", "region"]);
    });

    it("prefixes names that collide with existing client options or reserved names", () => {
        expect(getSdkVariableOptionNames(["baseUrl", "apiKey"], ["apiKey"])).toEqual([
            "sdkVariableBaseUrl",
            "sdkVariableApiKey"
        ]);
    });

    it("never produces duplicate names", () => {
        expect(getSdkVariableOptionNames(["rootVariable", "rootVariable", "rootVariable"])).toEqual([
            "rootVariable",
            "sdkVariableRootVariable",
            "sdkVariableRootVariable2"
        ]);
    });
});
