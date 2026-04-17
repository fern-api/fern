import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { getAvailabilityDocs } from "../getAvailabilityDocs.js";

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is undefined", () => {
        expect(getAvailabilityDocs(undefined)).toBeUndefined();
    });

    it("returns @deprecated for deprecated status without message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.Deprecated, message: undefined })).toBe(
            "@deprecated"
        );
    });

    it("returns @deprecated with message for deprecated status with message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.Deprecated, message: "Use v2 instead" })).toBe(
            "@deprecated Use v2 instead"
        );
    });

    it("returns @beta for InDevelopment status without message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.InDevelopment, message: undefined })).toBe(
            "@beta This endpoint is in development and may change."
        );
    });

    it("returns @beta with message for InDevelopment status with message", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.InDevelopment,
                message: "Expected Q3 release"
            })
        ).toBe("@beta This endpoint is in development and may change. Expected Q3 release");
    });

    it("returns @beta for PreRelease status without message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.PreRelease, message: undefined })).toBe(
            "@beta This endpoint is in pre-release and may change."
        );
    });

    it("returns @beta with message for PreRelease status with message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.PreRelease, message: "Beta 2" })).toBe(
            "@beta This endpoint is in pre-release and may change. Beta 2"
        );
    });

    it("returns undefined for GeneralAvailability status", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.GeneralAvailability,
                message: undefined
            })
        ).toBeUndefined();
    });
});
