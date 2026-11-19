import { describe, expect, it } from "vitest";

import { getPreviewPrivateRepoError, isPrivateRepoError } from "../getPreviewPrivateRepoError.js";

const privateRepo = async () => false;
const publicRepo = async () => true;

describe("getPreviewPrivateRepoError", () => {
    it("fails for a private repo in preview with an empty token", async () => {
        expect(
            await getPreviewPrivateRepoError({
                uri: "acme/sdk",
                token: "  ",
                previewMode: true,
                isPubliclyReadable: privateRepo
            })
        ).toBe(
            "--preview and --local can't run with a private repo (acme/sdk), remove --preview and generate to a local folder"
        );
    });

    it("allows a public repo in preview", async () => {
        expect(
            await getPreviewPrivateRepoError({
                uri: "acme/sdk",
                token: "",
                previewMode: true,
                isPubliclyReadable: publicRepo
            })
        ).toBeUndefined();
    });

    it("skips the check outside preview or with a literal token", async () => {
        const unexpected = async () => {
            throw new Error("should not check the repo");
        };
        expect(
            await getPreviewPrivateRepoError({
                uri: "acme/sdk",
                token: "",
                previewMode: false,
                isPubliclyReadable: unexpected
            })
        ).toBeUndefined();
        expect(
            await getPreviewPrivateRepoError({
                uri: "acme/sdk",
                token: "ghp_literal",
                previewMode: true,
                isPubliclyReadable: unexpected
            })
        ).toBeUndefined();
    });
});

describe("isPrivateRepoError", () => {
    it("recognizes authentication failures", () => {
        expect(isPrivateRepoError({ stderr: "remote: Repository not found.\nfatal: Authentication failed" })).toBe(
            true
        );
        expect(isPrivateRepoError({ stderr: "fatal: could not read Username for 'https://github.com'" })).toBe(true);
    });

    it("ignores network errors", () => {
        expect(isPrivateRepoError({ stderr: "fatal: unable to access: Could not resolve host: github.com" })).toBe(
            false
        );
    });
});
