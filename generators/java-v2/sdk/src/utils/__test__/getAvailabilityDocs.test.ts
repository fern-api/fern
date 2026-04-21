import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getAvailabilityDocs } from "../getAvailabilityDocs.js";

function buildEndpoint(availability: FernIr.Availability | undefined): FernIr.HttpEndpoint {
    return { availability } as unknown as FernIr.HttpEndpoint;
}

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is not set", () => {
        expect(getAvailabilityDocs(buildEndpoint(undefined))).toBeUndefined();
    });

    it("returns @deprecated with no message", () => {
        const endpoint = buildEndpoint({
            status: FernIr.AvailabilityStatus.Deprecated,
            message: undefined
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated");
    });

    it("returns @deprecated with message", () => {
        const endpoint = buildEndpoint({
            status: FernIr.AvailabilityStatus.Deprecated,
            message: "Use v2 instead"
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated Use v2 instead");
    });

    it("returns @apiNote warning for IN_DEVELOPMENT", () => {
        const endpoint = buildEndpoint({
            status: FernIr.AvailabilityStatus.InDevelopment,
            message: undefined
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@apiNote This endpoint is in development and may change.");
    });

    it("appends message for IN_DEVELOPMENT", () => {
        const endpoint = buildEndpoint({
            status: FernIr.AvailabilityStatus.InDevelopment,
            message: "Alpha 1"
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@apiNote This endpoint is in development and may change. Alpha 1");
    });

    it("returns @apiNote warning for PRE_RELEASE", () => {
        const endpoint = buildEndpoint({
            status: FernIr.AvailabilityStatus.PreRelease,
            message: undefined
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@apiNote This endpoint is in pre-release and may change.");
    });

    it("appends message for PRE_RELEASE", () => {
        const endpoint = buildEndpoint({
            status: FernIr.AvailabilityStatus.PreRelease,
            message: "Beta 2"
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@apiNote This endpoint is in pre-release and may change. Beta 2");
    });

    it("returns undefined for GENERAL_AVAILABILITY", () => {
        const endpoint = buildEndpoint({
            status: FernIr.AvailabilityStatus.GeneralAvailability,
            message: undefined
        });
        expect(getAvailabilityDocs(endpoint)).toBeUndefined();
    });
});
