import { parseRepository } from "../parseRepository.js";

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
});
