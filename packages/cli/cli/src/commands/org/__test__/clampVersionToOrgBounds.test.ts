import { describe, expect, it } from "vitest";

import { clampVersionToOrgBounds } from "../orgConfig.js";

describe("clampVersionToOrgBounds", () => {
    it("returns the intended version unchanged when no bounds are set", () => {
        expect(clampVersionToOrgBounds("5.45.0", {})).toEqual({ version: "5.45.0" });
    });

    describe("floor (min)", () => {
        it("bumps up to the floor when intended is below it", () => {
            expect(clampVersionToOrgBounds("5.40.0", { min: "5.45.0" })).toEqual({
                version: "5.45.0",
                reason: "floor"
            });
        });

        it("leaves the intended version when it is at the floor", () => {
            expect(clampVersionToOrgBounds("5.45.0", { min: "5.45.0" })).toEqual({ version: "5.45.0" });
        });

        it("leaves the intended version when it is above the floor", () => {
            expect(clampVersionToOrgBounds("5.50.0", { min: "5.45.0" })).toEqual({ version: "5.50.0" });
        });
    });

    describe("ceiling (max)", () => {
        it("caps down to the ceiling when intended is above it", () => {
            expect(clampVersionToOrgBounds("5.60.0", { max: "5.50.0" })).toEqual({
                version: "5.50.0",
                reason: "ceiling"
            });
        });

        it("leaves the intended version when it is at the ceiling", () => {
            expect(clampVersionToOrgBounds("5.50.0", { max: "5.50.0" })).toEqual({ version: "5.50.0" });
        });

        it("leaves the intended version when it is below the ceiling", () => {
            expect(clampVersionToOrgBounds("5.40.0", { max: "5.50.0" })).toEqual({ version: "5.40.0" });
        });
    });

    describe("range (min + max)", () => {
        it("keeps a version already inside the range", () => {
            expect(clampVersionToOrgBounds("5.45.0", { min: "5.40.0", max: "5.50.0" })).toEqual({ version: "5.45.0" });
        });

        it("bumps up to the floor for a version below the range", () => {
            expect(clampVersionToOrgBounds("5.30.0", { min: "5.40.0", max: "5.50.0" })).toEqual({
                version: "5.40.0",
                reason: "floor"
            });
        });

        it("caps down to the ceiling for a version above the range", () => {
            expect(clampVersionToOrgBounds("5.99.0", { min: "5.40.0", max: "5.50.0" })).toEqual({
                version: "5.50.0",
                reason: "ceiling"
            });
        });
    });

    describe("exact pin (min == max)", () => {
        it("bumps a lower version up to the pin", () => {
            expect(clampVersionToOrgBounds("5.40.0", { min: "5.45.0", max: "5.45.0" })).toEqual({
                version: "5.45.0",
                reason: "floor"
            });
        });

        it("caps a higher version down to the pin", () => {
            expect(clampVersionToOrgBounds("5.50.0", { min: "5.45.0", max: "5.45.0" })).toEqual({
                version: "5.45.0",
                reason: "ceiling"
            });
        });

        it("leaves a version already at the pin", () => {
            expect(clampVersionToOrgBounds("5.45.0", { min: "5.45.0", max: "5.45.0" })).toEqual({ version: "5.45.0" });
        });
    });

    it("handles prerelease bounds", () => {
        expect(clampVersionToOrgBounds("5.45.0-rc0", { min: "5.45.0" })).toEqual({
            version: "5.45.0",
            reason: "floor"
        });
    });
});
