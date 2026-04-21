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

    it("returns @deprecated (no trailing space) for deprecated status with empty-string message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.Deprecated, message: "" })).toBe("@deprecated");
    });

    it("returns @deprecated (no trailing space) for deprecated status with whitespace-only message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.Deprecated, message: "   " })).toBe(
            "@deprecated"
        );
    });

    it("returns @note for InDevelopment status without message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.InDevelopment, message: undefined })).toBe(
            "@note This endpoint is in development and may change."
        );
    });

    it("returns @note with message for InDevelopment status with message", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.InDevelopment,
                message: "Expected Q3 release"
            })
        ).toBe("@note This endpoint is in development and may change. Expected Q3 release");
    });

    it("returns @note (no trailing space) for InDevelopment status with empty-string message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.InDevelopment, message: "" })).toBe(
            "@note This endpoint is in development and may change."
        );
    });

    it("returns @note for PreRelease status without message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.PreRelease, message: undefined })).toBe(
            "@note This endpoint is in pre-release and may change."
        );
    });

    it("returns @note with message for PreRelease status with message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.PreRelease, message: "Beta 2" })).toBe(
            "@note This endpoint is in pre-release and may change. Beta 2"
        );
    });

    it("returns @note (no trailing space) for PreRelease status with empty-string message", () => {
        expect(getAvailabilityDocs({ status: FernIr.AvailabilityStatus.PreRelease, message: "" })).toBe(
            "@note This endpoint is in pre-release and may change."
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
