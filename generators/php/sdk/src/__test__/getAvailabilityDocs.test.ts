import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getAvailabilityDocs, getEndpointDocs } from "../endpoint/utils/getAvailabilityDocs.js";

function buildEndpoint(partial: Partial<FernIr.HttpEndpoint>): FernIr.HttpEndpoint {
    return partial as FernIr.HttpEndpoint;
}

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is undefined", () => {
        const endpoint = buildEndpoint({ availability: undefined });
        expect(getAvailabilityDocs(endpoint)).toBeUndefined();
    });

    it("returns @deprecated for deprecated status without message", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.Deprecated, message: undefined }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated");
    });

    it("returns @deprecated with message for deprecated status with message", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.Deprecated, message: "Use v2 instead" }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated Use v2 instead");
    });

    it("returns @deprecated without trailing space for empty-string message", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.Deprecated, message: "" }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated");
    });

    it("returns @deprecated without trailing space for whitespace-only message", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.Deprecated, message: "   " }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@deprecated");
    });

    it("returns @experimental for InDevelopment status without message", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.InDevelopment, message: undefined }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@experimental This endpoint is in development and may change.");
    });

    it("returns @experimental with message for InDevelopment status with message", () => {
        const endpoint = buildEndpoint({
            availability: {
                status: FernIr.AvailabilityStatus.InDevelopment,
                message: "Expected Q3 release"
            }
        });
        expect(getAvailabilityDocs(endpoint)).toBe(
            "@experimental This endpoint is in development and may change. Expected Q3 release"
        );
    });

    it("returns @experimental without trailing space for empty-string message on InDevelopment", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.InDevelopment, message: "" }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@experimental This endpoint is in development and may change.");
    });

    it("returns @experimental for PreRelease status without message", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.PreRelease, message: undefined }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@experimental This endpoint is in pre-release and may change.");
    });

    it("returns @experimental with message for PreRelease status with message", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.PreRelease, message: "Beta 2" }
        });
        expect(getAvailabilityDocs(endpoint)).toBe(
            "@experimental This endpoint is in pre-release and may change. Beta 2"
        );
    });

    it("returns @experimental without trailing space for empty-string message on PreRelease", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.PreRelease, message: "" }
        });
        expect(getAvailabilityDocs(endpoint)).toBe("@experimental This endpoint is in pre-release and may change.");
    });

    it("returns undefined for GeneralAvailability status", () => {
        const endpoint = buildEndpoint({
            availability: { status: FernIr.AvailabilityStatus.GeneralAvailability, message: undefined }
        });
        expect(getAvailabilityDocs(endpoint)).toBeUndefined();
    });
});

describe("getEndpointDocs", () => {
    it("returns undefined when both docs and availability are undefined", () => {
        const endpoint = buildEndpoint({ docs: undefined, availability: undefined });
        expect(getEndpointDocs(endpoint)).toBeUndefined();
    });

    it("returns endpoint docs when availability is undefined", () => {
        const endpoint = buildEndpoint({ docs: "Fetches a plant.", availability: undefined });
        expect(getEndpointDocs(endpoint)).toBe("Fetches a plant.");
    });

    it("returns availability docs when endpoint docs are undefined", () => {
        const endpoint = buildEndpoint({
            docs: undefined,
            availability: { status: FernIr.AvailabilityStatus.Deprecated, message: "Use v2 instead" }
        });
        expect(getEndpointDocs(endpoint)).toBe("@deprecated Use v2 instead");
    });

    it("combines endpoint docs and availability docs when both are present", () => {
        const endpoint = buildEndpoint({
            docs: "Fetches a plant.",
            availability: { status: FernIr.AvailabilityStatus.Deprecated, message: "Use v2 instead" }
        });
        expect(getEndpointDocs(endpoint)).toBe("Fetches a plant.\n\n@deprecated Use v2 instead");
    });

    it("returns endpoint docs unchanged for GeneralAvailability", () => {
        const endpoint = buildEndpoint({
            docs: "Fetches a plant.",
            availability: { status: FernIr.AvailabilityStatus.GeneralAvailability, message: undefined }
        });
        expect(getEndpointDocs(endpoint)).toBe("Fetches a plant.");
    });
});
