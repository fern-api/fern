import { AvailabilityStatus } from "@fern-api/ir-sdk";

import { isMarkedUnstable } from "../utils/availabilityUtils";

describe("isMarkedUnstable", () => {
    it("should return false if the availability is undefined", () => {
        expect(isMarkedUnstable(undefined)).toBe(false);
    });

    it("should return false if the availability is marked stable", () => {
        expect(isMarkedUnstable({ status: AvailabilityStatus.GeneralAvailability, message: "" })).toBe(false);
    });

    it("should return true if the availability is marked deprecated", () => {
        expect(isMarkedUnstable({ status: AvailabilityStatus.Deprecated, message: "" })).toBe(true);
    });

    it("should return true if the availability is marked pre-release", () => {
        expect(isMarkedUnstable({ status: AvailabilityStatus.PreRelease, message: "" })).toBe(true);
    });

    it("should return true if the availability is marked in development", () => {
        expect(isMarkedUnstable({ status: AvailabilityStatus.InDevelopment, message: "" })).toBe(true);
    });
});
