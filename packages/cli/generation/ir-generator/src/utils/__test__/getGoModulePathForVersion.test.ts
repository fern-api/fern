import { describe, expect, it } from "vitest";

import { getGoModulePathForVersion } from "../getGoModulePathForVersion.js";

describe("getGoModulePathForVersion", () => {
    const modulePath = "github.com/acme/acme-go";

    it("leaves v0 and v1 module paths untouched", () => {
        expect(getGoModulePathForVersion(modulePath, "0.4.1")).toBe(modulePath);
        expect(getGoModulePathForVersion(modulePath, "1.57.3")).toBe(modulePath);
        expect(getGoModulePathForVersion(modulePath, "v1.0.0")).toBe(modulePath);
        expect(getGoModulePathForVersion(modulePath, "0.0.0-fern-placeholder")).toBe(modulePath);
    });

    it("appends the major version suffix from v2 on", () => {
        expect(getGoModulePathForVersion(modulePath, "2.0.0")).toBe(`${modulePath}/v2`);
        expect(getGoModulePathForVersion(modulePath, "v2.0.0")).toBe(`${modulePath}/v2`);
        expect(getGoModulePathForVersion(modulePath, "3.1.0-rc.1")).toBe(`${modulePath}/v3`);
        expect(getGoModulePathForVersion(modulePath, "12.0.0")).toBe(`${modulePath}/v12`);
    });

    it("does not double a suffix the module path already carries", () => {
        expect(getGoModulePathForVersion(`${modulePath}/v2`, "2.3.0")).toBe(`${modulePath}/v2`);
    });

    it("returns the module path as-is when the version is missing or unparseable", () => {
        expect(getGoModulePathForVersion(modulePath, undefined)).toBe(modulePath);
        expect(getGoModulePathForVersion(modulePath, "latest")).toBe(modulePath);
    });
});
