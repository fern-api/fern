import { describe, expect, it } from "vitest";

import { getMirroredFilePath } from "../astro/mirroredFilePath.js";

describe("getMirroredFilePath", () => {
    it("maps uploaded files to the mirror's /files route", () => {
        expect(getMirroredFilePath("/_fern-files/acme.docs.buildwithfern.com/abc123/logo.svg", "")).toBe(
            "/files/acme.docs.buildwithfern.com/abc123/logo.svg"
        );
    });

    it("honors the basepath", () => {
        expect(getMirroredFilePath("/docs/_fern-files/acme.com/abc123/logo.svg", "/docs")).toBe(
            "/files/acme.com/abc123/logo.svg"
        );
        expect(getMirroredFilePath("/_fern-files/acme.com/abc123/logo.svg", "/docs")).toBeUndefined();
    });

    it.each([
        "_nav/abc.json",
        "_mdx/abc.js",
        "_img/abc.webp",
        "_icons/solid/house.svg"
    ])("leaves the renderer's generated %s to the renderer", (rest) => {
        expect(getMirroredFilePath(`/_fern-files/${rest}`, "")).toBeUndefined();
        expect(getMirroredFilePath(`/docs/_fern-files/${rest}`, "/docs")).toBeUndefined();
    });

    it("leaves other requests to the renderer", () => {
        expect(getMirroredFilePath("/getting-started", "")).toBeUndefined();
        expect(getMirroredFilePath("/_astro/index.js", "")).toBeUndefined();
        expect(getMirroredFilePath(undefined, "")).toBeUndefined();
    });
});
