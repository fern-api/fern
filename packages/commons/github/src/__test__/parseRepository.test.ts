import {
    getGitAuthorizationConfig,
    getGitAuthorizationHeader,
    parseRepository,
    redactGitCredentials
} from "../parseRepository.js";

describe("parseRepository", () => {
    it("fern-api/fern", async () => {
        const tests = [
            "fern-api/fern",
            "github.com/fern-api/fern",
            "https://github.com/fern-api/fern",
            "https://github.com/fern-api/fern.git"
        ];
        for (const test of tests) {
            const reference = parseRepository(test);
            expect(reference.remote).toBe("github.com");
            expect(reference.owner).toBe("fern-api");
            expect(reference.repo).toBe("fern");
            expect(reference.repoUrl).toBe("https://github.com/fern-api/fern");
            expect(reference.cloneUrl).toBe("https://github.com/fern-api/fern.git");
            expect(reference.getAuthedCloneUrl("ghs_xyz")).toBe(
                "https://x-access-token:ghs_xyz@github.com/fern-api/fern.git"
            );
        }
    });

    it("getAuthedCloneUrl format depends on token type", () => {
        const ref = parseRepository("fern-api/fern");
        // GitHub App installation tokens authenticate as the special `x-access-token` user.
        expect(ref.getAuthedCloneUrl("ghs_install_token_value")).toBe(
            "https://x-access-token:ghs_install_token_value@github.com/fern-api/fern.git"
        );
        // User-to-server tokens issued by GitHub Apps also authenticate as `x-access-token`.
        expect(ref.getAuthedCloneUrl("ghu_user_to_server_value")).toBe(
            "https://x-access-token:ghu_user_to_server_value@github.com/fern-api/fern.git"
        );
        // OAuth user tokens (gho_*) authenticate as the token itself — using
        // `x-access-token:` as the username returns "Invalid username or token".
        expect(ref.getAuthedCloneUrl("gho_oauth_token_value")).toBe(
            "https://gho_oauth_token_value@github.com/fern-api/fern.git"
        );
        // Personal access tokens (ghp_*, github_pat_*) follow the same OAuth-style format.
        expect(ref.getAuthedCloneUrl("ghp_pat_value")).toBe("https://ghp_pat_value@github.com/fern-api/fern.git");
        expect(ref.getAuthedCloneUrl("github_pat_finegrained_value")).toBe(
            "https://github_pat_finegrained_value@github.com/fern-api/fern.git"
        );
        // Legacy 40-char hex PATs (pre-2021) follow the OAuth style — no prefix.
        expect(ref.getAuthedCloneUrl("0123456789abcdef0123456789abcdef01234567")).toBe(
            "https://0123456789abcdef0123456789abcdef01234567@github.com/fern-api/fern.git"
        );
    });
    it("invalid structure", async () => {
        expect(() => {
            parseRepository("fern");
        }).toThrow(Error);
    });
    it("too many slashes", async () => {
        expect(() => {
            parseRepository("github.com/fern-api//fern");
        }).toThrow(Error);
    });

    it("full URL produces correct owner and repo (FER-9146)", async () => {
        // Previously, code used uri.split("/") which would produce
        // owner = "https:" and repo = "" for full URLs.
        const reference = parseRepository("https://github.com/anduril/lattice-sdk-javascript");
        expect(reference.owner).toBe("anduril");
        expect(reference.repo).toBe("lattice-sdk-javascript");
        expect(reference.repoUrl).toBe("https://github.com/anduril/lattice-sdk-javascript");
    });

    it("custom github domain", async () => {
        const test = "https://github.acme.com/engineering/api-client-sdk.git";
        const reference = parseRepository(test);
        expect(reference.remote).toBe("github.acme.com");
        expect(reference.owner).toBe("engineering");
        expect(reference.repo).toBe("api-client-sdk");
        expect(reference.repoUrl).toBe("https://github.acme.com/engineering/api-client-sdk");
        expect(reference.cloneUrl).toBe("https://github.acme.com/engineering/api-client-sdk.git");
        expect(reference.getAuthedCloneUrl("ghs_xyz")).toBe(
            "https://x-access-token:ghs_xyz@github.acme.com/engineering/api-client-sdk.git"
        );
    });

    it("getGitAuthorizationHeader uses the same credentials as getAuthedCloneUrl", () => {
        const decode = (header: string): string =>
            Buffer.from(header.replace("Authorization: Basic ", ""), "base64").toString();
        expect(decode(getGitAuthorizationHeader("ghs_install_token_value"))).toBe(
            "x-access-token:ghs_install_token_value"
        );
        expect(decode(getGitAuthorizationHeader("ghu_user_to_server_value"))).toBe(
            "x-access-token:ghu_user_to_server_value"
        );
        expect(decode(getGitAuthorizationHeader("ghp_pat_value"))).toBe("ghp_pat_value:");
        expect(decode(getGitAuthorizationHeader("github_pat_value"))).toBe("github_pat_value:");
    });

    it("getGitAuthorizationConfig scopes the header to the repository host", () => {
        const token = "ghp_abc";
        expect(getGitAuthorizationConfig("github.com", token)).toBe(
            `http.https://github.com/.extraHeader=${getGitAuthorizationHeader(token)}`
        );
        expect(getGitAuthorizationConfig("github.acme.com", token)).toMatch(
            /^http\.https:\/\/github\.acme\.com\/\.extraHeader=/
        );
    });

    it("redactGitCredentials removes the raw and encoded token", () => {
        for (const token of ["ghp_abc", "ghs_xyz"]) {
            const header = getGitAuthorizationHeader(token);
            const message = `git clone --config http.https://github.com/.extraHeader=${header} https://${token}@github.com/o/r.git failed`;
            const redacted = redactGitCredentials(message, token);
            expect(redacted).not.toContain(token);
            expect(redacted).not.toContain(header.replace("Authorization: Basic ", ""));
            expect(redacted).toContain("Authorization: Basic [REDACTED]");
        }
    });
});
