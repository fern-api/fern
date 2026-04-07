import { describe, expect, it } from "vitest";
import { convertGitOutput } from "../converters/convertGitOutput.js";

describe("convertGitOutput", () => {
    it("returns no gitOutput for undefined input", () => {
        const result = convertGitOutput(undefined);
        expect(result.gitOutput).toBeUndefined();
        expect(result.warnings).toEqual([]);
    });

    // ── Mode conversions ────────────────────────────────────────────────────

    it("converts pull-request mode to 'pr'", () => {
        const result = convertGitOutput({ repository: "acme/sdk", mode: "pull-request" });
        expect(result.gitOutput?.mode).toBe("pr");
        expect(result.gitOutput).toMatchObject({ repository: "acme/sdk" });
    });

    it("converts push mode to 'push'", () => {
        const result = convertGitOutput({ repository: "acme/sdk", mode: "push" });
        expect(result.gitOutput?.mode).toBe("push");
    });

    it("converts commit mode to 'release'", () => {
        const result = convertGitOutput({ repository: "acme/sdk", mode: "commit" });
        expect(result.gitOutput?.mode).toBe("release");
    });

    it("converts release mode to 'release'", () => {
        const result = convertGitOutput({ repository: "acme/sdk", mode: "release" });
        expect(result.gitOutput?.mode).toBe("release");
    });

    it("defaults to release mode when no mode is specified", () => {
        // GithubCommitAndReleaseSchema without explicit mode defaults to release
        const result = convertGitOutput({ repository: "acme/sdk" } as never);
        expect(result.gitOutput?.mode).toBe("release");
    });

    // ── Branch ──────────────────────────────────────────────────────────────

    it("preserves branch field", () => {
        const result = convertGitOutput({ repository: "acme/sdk", mode: "pull-request", branch: "main" });
        expect(result.gitOutput?.branch).toBe("main");
    });

    it("omits branch when not set", () => {
        const result = convertGitOutput({ repository: "acme/sdk", mode: "pull-request" });
        expect(result.gitOutput?.branch).toBeUndefined();
    });

    // ── License ─────────────────────────────────────────────────────────────

    it("passes through string license (MIT)", () => {
        const result = convertGitOutput({ repository: "acme/sdk", mode: "pull-request", license: "MIT" });
        expect(result.gitOutput?.license).toBe("MIT");
    });

    it("passes through string license (Apache-2.0)", () => {
        const result = convertGitOutput({
            repository: "acme/sdk",
            mode: "pull-request",
            license: "Apache-2.0"
        });
        expect(result.gitOutput?.license).toBe("Apache-2.0");
    });

    it("converts {custom: path} license to string and adds info warning", () => {
        const result = convertGitOutput({
            repository: "acme/sdk",
            mode: "pull-request",
            license: { custom: "./LICENSE" }
        });
        expect(result.gitOutput?.license).toBe("./LICENSE");
        const warn = result.warnings.find((w) => w.message.toLowerCase().includes("license"));
        expect(warn).toBeDefined();
        expect(warn?.type).toBe("info");
    });

    // ── Reviewers ───────────────────────────────────────────────────────────

    it("warns on reviewers configuration as unsupported", () => {
        const result = convertGitOutput({
            repository: "acme/sdk",
            mode: "pull-request",
            reviewers: { teams: ["my-team"], users: ["alice"] }
        } as never);
        const warn = result.warnings.find((w) => w.message.includes("reviewers"));
        expect(warn).toBeDefined();
        expect(warn?.type).toBe("unsupported");
        // reviewers should NOT appear in the git output schema
        expect(result.gitOutput).not.toHaveProperty("reviewers");
    });

    // ── Self-hosted GitHub ──────────────────────────────────────────────────

    it("handles self-hosted GitHub config (uri + token) with unsupported warning", () => {
        const result = convertGitOutput({
            uri: "https://github.enterprise.com/acme/sdk",
            token: "${GH_TOKEN}",
            mode: "pull-request"
        } as never);
        expect(result.gitOutput).toMatchObject({ repository: "https://github.enterprise.com/acme/sdk" });
        const warn = result.warnings.find((w) => w.message.includes("Self-hosted"));
        expect(warn).toBeDefined();
        expect(warn?.type).toBe("unsupported");
    });

    it("preserves branch on self-hosted config", () => {
        const result = convertGitOutput({
            uri: "https://github.enterprise.com/acme/sdk",
            token: "${GH_TOKEN}",
            branch: "develop"
        } as never);
        expect(result.gitOutput?.branch).toBe("develop");
    });

    it("converts license on self-hosted config", () => {
        const result = convertGitOutput({
            uri: "https://github.enterprise.com/acme/sdk",
            token: "${GH_TOKEN}",
            license: "MIT"
        } as never);
        expect(result.gitOutput?.license).toBe("MIT");
    });

    // ── Real-world xai-like config ──────────────────────────────────────────

    it("converts a real-world xai-like GitHub output config", () => {
        const result = convertGitOutput({
            repository: "fern-demo/xai-typescript",
            mode: "pull-request"
        });
        expect(result.gitOutput).toEqual({
            repository: "fern-demo/xai-typescript",
            mode: "pr"
        });
        expect(result.warnings).toEqual([]);
    });

    it("converts a real-world xai-like gRPC GitHub output config", () => {
        const result = convertGitOutput({
            repository: "fern-demo/xai-dotnet",
            mode: "pull-request"
        });
        expect(result.gitOutput).toEqual({
            repository: "fern-demo/xai-dotnet",
            mode: "pr"
        });
        expect(result.warnings).toEqual([]);
    });
});
