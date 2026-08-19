import { describe, expect, it } from "vitest";

import { toPreviewPackageName } from "../toPreviewPackageName.js";

describe("toPreviewPackageName", () => {
    it("replaces existing scope with org-preview scope", () => {
        expect(toPreviewPackageName("@fern-fern/docs-parsers", "fern")).toBe("@fern-preview/docs-parsers");
    });

    it("uses org from parameter, not from package scope", () => {
        expect(toPreviewPackageName("@acme/python-sdk", "acme")).toBe("@acme-preview/python-sdk");
    });

    it("adds preview scope to unscoped packages", () => {
        expect(toPreviewPackageName("my-package", "fern")).toBe("@fern-preview/my-package");
    });

    it("strips scope regardless of original scope name", () => {
        expect(toPreviewPackageName("@some-other-scope/sdk", "myorg")).toBe("@myorg-preview/sdk");
    });

    it("preserves complex package names after scope", () => {
        expect(toPreviewPackageName("@fern-fern/docs-parsers-fern-definition", "fern")).toBe(
            "@fern-preview/docs-parsers-fern-definition"
        );
    });
});
