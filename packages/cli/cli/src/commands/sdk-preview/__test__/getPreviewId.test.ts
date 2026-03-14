import { describe, expect, it } from "vitest";

import { sanitizeBranchName } from "../getPreviewId.js";

describe("sanitizeBranchName", () => {
    it("converts slashes to hyphens", () => {
        expect(sanitizeBranchName("feat/add-auth")).toBe("feat-add-auth");
    });

    it("converts uppercase to lowercase", () => {
        expect(sanitizeBranchName("Feature/AddAuth")).toBe("feature-addauth");
    });

    it("replaces non-alphanumeric characters with hyphens", () => {
        expect(sanitizeBranchName("feat/add_auth@v2")).toBe("feat-add-auth-v2");
    });

    it("collapses consecutive hyphens", () => {
        expect(sanitizeBranchName("feat//add--auth")).toBe("feat-add-auth");
    });

    it("trims leading and trailing hyphens", () => {
        expect(sanitizeBranchName("/feat/add-auth/")).toBe("feat-add-auth");
    });

    it("truncates to 40 characters", () => {
        const longBranch = "a".repeat(50);
        expect(sanitizeBranchName(longBranch)).toHaveLength(40);
    });

    it("handles simple branch names", () => {
        expect(sanitizeBranchName("main")).toBe("main");
        expect(sanitizeBranchName("develop")).toBe("develop");
    });

    it("handles branch names with dots", () => {
        expect(sanitizeBranchName("release/v1.2.3")).toBe("release-v1-2-3");
    });

    it("handles user-prefixed branches", () => {
        expect(sanitizeBranchName("lifanzou/sdk-preview-research")).toBe("lifanzou-sdk-preview-research");
    });
});
