import { describe, expect, it } from "vitest";

import { computePypiPreviewVersion, sanitizeForPypiLocalSegment } from "../computePreviewVersion.js";
import { isValidPep440DevLocalVersion } from "../pep440.js";
import { toPreviewPackageName, toPypiPreviewPackageName } from "../toPreviewPackageName.js";

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

describe("toPypiPreviewPackageName", () => {
    it("normalizes hyphens", () => {
        expect(toPypiPreviewPackageName("acme-sdk", "acme")).toBe("acme-preview-acme-sdk");
    });
    it("normalizes underscores to hyphens (PEP 503)", () => {
        expect(toPypiPreviewPackageName("acme_sdk", "acme")).toBe("acme-preview-acme-sdk");
    });
    it("normalizes dots to hyphens (PEP 503)", () => {
        expect(toPypiPreviewPackageName("acme.sdk", "acme")).toBe("acme-preview-acme-sdk");
    });
    it("lowercases mixed-case names", () => {
        expect(toPypiPreviewPackageName("Acme_SDK", "Acme")).toBe("acme-preview-acme-sdk");
    });
    it("collapses runs of separators", () => {
        expect(toPypiPreviewPackageName("acme___sdk", "acme")).toBe("acme-preview-acme-sdk");
    });
});

describe("computePypiPreviewVersion", () => {
    it("produces a PEP 440-valid version for canonical preview ids", () => {
        const v = computePypiPreviewVersion({ previewId: "feat-add-auth" });
        expect(v).toMatch(/^0\.0\.1\.dev\d+\+feat\.add\.auth$/);
        expect(isValidPep440DevLocalVersion(v)).toBe(true);
    });
    it("produces a PEP 440-valid version for slashed branch ids", () => {
        const v = computePypiPreviewVersion({ previewId: "feat/x" });
        expect(isValidPep440DevLocalVersion(v)).toBe(true);
    });
    it("produces a PEP 440-valid version for numeric prefix", () => {
        const v = computePypiPreviewVersion({ previewId: "123-numeric" });
        expect(isValidPep440DevLocalVersion(v)).toBe(true);
    });
    it("produces a PEP 440-valid version for RELEASE_BRANCH", () => {
        const v = computePypiPreviewVersion({ previewId: "RELEASE_BRANCH" });
        expect(isValidPep440DevLocalVersion(v)).toBe(true);
    });
    it("falls back to 'preview' for empty previewId", () => {
        const v = computePypiPreviewVersion({ previewId: "" });
        expect(v).toMatch(/^0\.0\.1\.dev\d+\+preview$/);
    });
});

describe("sanitizeForPypiLocalSegment", () => {
    it("rejects unicode by replacing with dot then collapsing", () => {
        expect(sanitizeForPypiLocalSegment("caf\u00e9-feat")).toBe("caf.feat");
    });
    it("caps length at 64", () => {
        const long = "a".repeat(80);
        expect(sanitizeForPypiLocalSegment(long).length).toBeLessThanOrEqual(64);
    });
});
