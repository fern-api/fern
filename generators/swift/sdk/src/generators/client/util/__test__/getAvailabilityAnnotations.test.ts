import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { getAvailabilityAnnotations } from "../getAvailabilityAnnotations.js";

describe("getAvailabilityAnnotations", () => {
    it("returns undefined when availability is undefined", () => {
        expect(getAvailabilityAnnotations(undefined)).toBeUndefined();
    });

    it("returns undefined for GeneralAvailability status", () => {
        expect(
            getAvailabilityAnnotations({
                status: FernIr.AvailabilityStatus.GeneralAvailability,
                message: undefined
            })
        ).toBeUndefined();
    });

    it("emits @available attribute without message for Deprecated status", () => {
        const result = getAvailabilityAnnotations({
            status: FernIr.AvailabilityStatus.Deprecated,
            message: undefined
        });
        expect(result?.docs).toBeUndefined();
        expect(result?.attribute?.name).toBe("available");
        expect(result?.attribute?.arguments?.length).toBe(2);
    });

    it("emits @available attribute with message for Deprecated status", () => {
        const result = getAvailabilityAnnotations({
            status: FernIr.AvailabilityStatus.Deprecated,
            message: "Use v2 instead"
        });
        expect(result?.docs).toBeUndefined();
        expect(result?.attribute?.name).toBe("available");
        expect(result?.attribute?.arguments?.length).toBe(3);
        const messageArg = result?.attribute?.arguments?.[2];
        expect(messageArg?.label).toBe("message");
        expect(messageArg?.toString()).toBe('message: "Use v2 instead"');
    });

    it("escapes double quotes in Deprecated message", () => {
        const result = getAvailabilityAnnotations({
            status: FernIr.AvailabilityStatus.Deprecated,
            message: 'Use "v2" instead'
        });
        const messageArg = result?.attribute?.arguments?.[2];
        expect(messageArg?.toString()).toBe('message: "Use \\"v2\\" instead"');
    });

    it("returns @beta doc comment for InDevelopment status without message", () => {
        const result = getAvailabilityAnnotations({
            status: FernIr.AvailabilityStatus.InDevelopment,
            message: undefined
        });
        expect(result?.attribute).toBeUndefined();
        expect(result?.docs).toBe("@beta This endpoint is in development and may change.");
    });

    it("returns @beta doc comment with message for InDevelopment status with message", () => {
        const result = getAvailabilityAnnotations({
            status: FernIr.AvailabilityStatus.InDevelopment,
            message: "Expected Q3 release"
        });
        expect(result?.attribute).toBeUndefined();
        expect(result?.docs).toBe("@beta This endpoint is in development and may change. Expected Q3 release");
    });

    it("returns @beta doc comment for PreRelease status without message", () => {
        const result = getAvailabilityAnnotations({
            status: FernIr.AvailabilityStatus.PreRelease,
            message: undefined
        });
        expect(result?.attribute).toBeUndefined();
        expect(result?.docs).toBe("@beta This endpoint is in pre-release and may change.");
    });

    it("returns @beta doc comment with message for PreRelease status with message", () => {
        const result = getAvailabilityAnnotations({
            status: FernIr.AvailabilityStatus.PreRelease,
            message: "Beta 2"
        });
        expect(result?.attribute).toBeUndefined();
        expect(result?.docs).toBe("@beta This endpoint is in pre-release and may change. Beta 2");
    });
});
