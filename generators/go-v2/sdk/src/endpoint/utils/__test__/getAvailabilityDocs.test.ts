import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { combineDocsWithAvailability, getAvailabilityDocs } from "../getAvailabilityDocs.js";

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is undefined", () => {
        expect(getAvailabilityDocs(undefined)).toBeUndefined();
    });

    it("returns a Go-style Deprecated paragraph for deprecated without a message", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.Deprecated,
                message: undefined
            })
        ).toBe("Deprecated: This endpoint is deprecated.");
    });

    it("returns Deprecated: <message> for deprecated with a message", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.Deprecated,
                message: "Use v2 instead"
            })
        ).toBe("Deprecated: Use v2 instead");
    });

    it("returns the @beta in-development note without a message", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.InDevelopment,
                message: undefined
            })
        ).toBe("@beta This endpoint is in development and may change.");
    });

    it("appends the message to the @beta in-development note", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.InDevelopment,
                message: "Expected Q3 release"
            })
        ).toBe("@beta This endpoint is in development and may change. Expected Q3 release");
    });

    it("returns the @beta pre-release note without a message", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.PreRelease,
                message: undefined
            })
        ).toBe("@beta This endpoint is in pre-release and may change.");
    });

    it("appends the message to the @beta pre-release note", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.PreRelease,
                message: "Beta 2"
            })
        ).toBe("@beta This endpoint is in pre-release and may change. Beta 2");
    });

    it("returns undefined for GeneralAvailability", () => {
        expect(
            getAvailabilityDocs({
                status: FernIr.AvailabilityStatus.GeneralAvailability,
                message: undefined
            })
        ).toBeUndefined();
    });
});

describe("combineDocsWithAvailability", () => {
    it("returns the original docs when availability is undefined", () => {
        expect(combineDocsWithAvailability("Does a thing.", undefined)).toBe("Does a thing.");
    });

    it("returns undefined when both inputs are empty", () => {
        expect(combineDocsWithAvailability(undefined, undefined)).toBeUndefined();
    });

    it("returns the availability line alone when docs are empty", () => {
        expect(
            combineDocsWithAvailability(undefined, {
                status: FernIr.AvailabilityStatus.Deprecated,
                message: "Use v2 instead"
            })
        ).toBe("Deprecated: Use v2 instead");
    });

    it("separates existing docs from the availability paragraph with a blank line", () => {
        expect(
            combineDocsWithAvailability("Does a thing.", {
                status: FernIr.AvailabilityStatus.Deprecated,
                message: "Use v2 instead"
            })
        ).toBe("Does a thing.\n\nDeprecated: Use v2 instead");
    });
});
