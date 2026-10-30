import { describe, expect, it } from "vitest";

import { getPreviewPrivateRepoHint } from "../getPreviewPrivateRepoHint.js";

describe("getPreviewPrivateRepoHint", () => {
    it("explains that --preview blanks the token", () => {
        const hint = getPreviewPrivateRepoHint({ uri: "acme/sdk", token: "", previewMode: true });
        expect(hint).toContain("github.token for acme/sdk is empty");
        expect(hint).toContain("without --preview");
    });

    it("treats a whitespace-only token as empty", () => {
        expect(getPreviewPrivateRepoHint({ uri: "acme/sdk", token: "  ", previewMode: true })).toBeDefined();
    });

    it("returns undefined outside preview", () => {
        expect(getPreviewPrivateRepoHint({ uri: "acme/sdk", token: "", previewMode: false })).toBeUndefined();
    });

    it("returns undefined when preview keeps a literal token", () => {
        expect(getPreviewPrivateRepoHint({ uri: "acme/sdk", token: "ghp_literal", previewMode: true })).toBeUndefined();
    });
});
