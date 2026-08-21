import { describe, expect, it } from "vitest";

import { getTargetFrameworkRequirements, TARGET_FRAMEWORKS } from "../targetFrameworks.js";

describe("getTargetFrameworkRequirements", () => {
    it("renders the generated project's target frameworks", () => {
        expect(getTargetFrameworkRequirements()).toEqual([
            ".NET 8 and above",
            ".NET Framework 4.6.2 and above",
            ".NET Standard 2.0 and above"
        ]);
    });

    it("collapses modern .NET versions into the lowest one", () => {
        expect(getTargetFrameworkRequirements(["net9.0", "net10.0", "net8.0"])).toEqual([".NET 8 and above"]);
    });

    it("renders two-digit .NET Framework monikers", () => {
        expect(getTargetFrameworkRequirements(["net48"])).toEqual([".NET Framework 4.8 and above"]);
    });

    it("ignores unrecognized monikers", () => {
        expect(getTargetFrameworkRequirements(["net8.0-android", "nonsense"])).toEqual([]);
    });

    it("returns an empty list when there are no target frameworks", () => {
        expect(getTargetFrameworkRequirements([])).toEqual([]);
    });

    it("keeps the csproj and requirements in sync", () => {
        expect(TARGET_FRAMEWORKS.join(";")).toBe("net462;net8.0;net9.0;netstandard2.0");
    });
});
