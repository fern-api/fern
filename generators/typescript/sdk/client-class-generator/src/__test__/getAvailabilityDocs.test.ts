import { FernIr } from "@fern-fern/ir-sdk";
import { createHttpEndpoint } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";
import { getAvailabilityDocs } from "../endpoints/utils/getAvailabilityDocs.js";

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is undefined", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = undefined;
        expect(getAvailabilityDocs(endpoint)).toBeUndefined();
    });

    it("returns @deprecated for deprecated status without message", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = { status: FernIr.AvailabilityStatus.Deprecated, message: undefined };
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated");
    });

    it("returns @deprecated with message for deprecated status with message", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = { status: FernIr.AvailabilityStatus.Deprecated, message: "Use v2 instead" };
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated Use v2 instead");
    });

    it("returns @beta for InDevelopment status without message", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = { status: FernIr.AvailabilityStatus.InDevelopment, message: undefined };
        expect(getAvailabilityDocs(endpoint)).toBe("@beta This endpoint is in development and may change.");
    });

    it("returns @beta with message for InDevelopment status with message", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = {
            status: FernIr.AvailabilityStatus.InDevelopment,
            message: "Expected Q3 release"
        };
        expect(getAvailabilityDocs(endpoint)).toBe(
            "@beta This endpoint is in development and may change. Expected Q3 release"
        );
    });

    it("returns @beta for PreRelease status without message", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = { status: FernIr.AvailabilityStatus.PreRelease, message: undefined };
        expect(getAvailabilityDocs(endpoint)).toBe("@beta This endpoint is in pre-release and may change.");
    });

    it("returns @beta with message for PreRelease status with message", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = { status: FernIr.AvailabilityStatus.PreRelease, message: "Beta 2" };
        expect(getAvailabilityDocs(endpoint)).toBe("@beta This endpoint is in pre-release and may change. Beta 2");
    });

    it("returns undefined for GeneralAvailability status", () => {
        const endpoint = createHttpEndpoint();
        endpoint.availability = { status: FernIr.AvailabilityStatus.GeneralAvailability, message: undefined };
        expect(getAvailabilityDocs(endpoint)).toBeUndefined();
    });
});
