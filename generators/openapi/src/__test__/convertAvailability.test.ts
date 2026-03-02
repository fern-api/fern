import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { convertAvailabilityStatus } from "../utils/convertAvailability.js";

describe("convertAvailabilityStatus", () => {
    it("converts IN_DEVELOPMENT to 'in-development'", () => {
        expect(convertAvailabilityStatus(FernIr.AvailabilityStatus.InDevelopment)).toBe("in-development");
    });

    it("converts PRE_RELEASE to 'pre-release'", () => {
        expect(convertAvailabilityStatus(FernIr.AvailabilityStatus.PreRelease)).toBe("pre-release");
    });

    it("converts GENERAL_AVAILABILITY to 'generally-available'", () => {
        expect(convertAvailabilityStatus(FernIr.AvailabilityStatus.GeneralAvailability)).toBe("generally-available");
    });

    it("converts DEPRECATED to 'deprecated'", () => {
        expect(convertAvailabilityStatus(FernIr.AvailabilityStatus.Deprecated)).toBe("deprecated");
    });

    it("returns undefined for unknown status", () => {
        expect(convertAvailabilityStatus("UNKNOWN_STATUS" as FernIr.AvailabilityStatus)).toBeUndefined();
    });
});
