import { AvailabilityStatus } from "@fern-api/ir-sdk";
import { describe, expect, it } from "vitest";
import { AbstractConverterContext } from "../AbstractConverterContext.js";
import { FernAvailabilityExtension } from "../extensions/x-fern-availability.js";

function convert(value: unknown): AvailabilityStatus | undefined {
    return new FernAvailabilityExtension({
        breadcrumbs: [],
        node: { "x-fern-availability": value },
        context: {} as AbstractConverterContext<object>
    }).convert();
}

describe("FernAvailabilityExtension", () => {
    it.each([
        ["generally-available", AvailabilityStatus.GeneralAvailability],
        ["general-availability", AvailabilityStatus.GeneralAvailability],
        ["ga", AvailabilityStatus.GeneralAvailability],
        ["stable", AvailabilityStatus.GeneralAvailability],
        ["in-development", AvailabilityStatus.InDevelopment],
        ["pre-release", AvailabilityStatus.PreRelease],
        ["alpha", AvailabilityStatus.Alpha],
        ["beta", AvailabilityStatus.Beta],
        ["preview", AvailabilityStatus.Preview],
        ["legacy", AvailabilityStatus.Legacy],
        ["deprecated", AvailabilityStatus.Deprecated]
    ])("converts %s", (value, expected) => {
        expect(convert(value)).toBe(expected);
    });

    it("returns undefined for unknown values", () => {
        expect(convert("unknown")).toBeUndefined();
    });
});
