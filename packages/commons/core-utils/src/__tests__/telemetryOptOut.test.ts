import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isTelemetryOptedOutByEnv } from "../fallbacks/telemetryOptOut.js";

describe("isTelemetryOptedOutByEnv", () => {
    const original = process.env.FERN_DISABLE_TELEMETRY;

    beforeEach(() => {
        delete process.env.FERN_DISABLE_TELEMETRY;
    });

    afterEach(() => {
        if (original == null) {
            delete process.env.FERN_DISABLE_TELEMETRY;
        } else {
            process.env.FERN_DISABLE_TELEMETRY = original;
        }
    });

    it("is false when the variable is unset", () => {
        expect(isTelemetryOptedOutByEnv()).toBe(false);
    });

    it("is true only for the exact value true", () => {
        process.env.FERN_DISABLE_TELEMETRY = "true";
        expect(isTelemetryOptedOutByEnv()).toBe(true);
    });

    it.each(["1", "yes", "TRUE", "false", ""])("is false for %j", (value) => {
        process.env.FERN_DISABLE_TELEMETRY = value;
        expect(isTelemetryOptedOutByEnv()).toBe(false);
    });
});
