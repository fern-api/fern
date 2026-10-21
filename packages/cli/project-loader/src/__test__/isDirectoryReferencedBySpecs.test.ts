import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { isDirectoryReferencedBySpecs } from "../getDocsInlineSpecPaths.js";

describe("isDirectoryReferencedBySpecs", () => {
    const directory = AbsoluteFilePath.of("/fern/openapi");

    it("is true for a spec inside the directory", () => {
        expect(isDirectoryReferencedBySpecs(directory, [AbsoluteFilePath.of("/fern/openapi/nested/spec.yml")])).toBe(
            true
        );
    });

    it("is true for a spec whose file name starts with two dots", () => {
        expect(isDirectoryReferencedBySpecs(directory, [AbsoluteFilePath.of("/fern/openapi/..internal.yml")])).toBe(
            true
        );
    });

    it("is false for a spec outside the directory", () => {
        expect(
            isDirectoryReferencedBySpecs(directory, [
                AbsoluteFilePath.of("/fern/specs/public.yml"),
                AbsoluteFilePath.of("/fern/openapi-other/spec.yml")
            ])
        ).toBe(false);
    });
});
