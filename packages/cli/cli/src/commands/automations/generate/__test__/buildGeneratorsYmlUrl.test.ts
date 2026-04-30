import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildGeneratorsYmlUrl } from "../GeneratorRunResult.js";

const ENV_KEYS = ["GITHUB_SERVER_URL", "GITHUB_REPOSITORY", "GITHUB_REF_NAME", "GITHUB_WORKSPACE"] as const;

describe("buildGeneratorsYmlUrl", () => {
    const saved: Record<(typeof ENV_KEYS)[number], string | undefined> = {
        GITHUB_SERVER_URL: undefined,
        GITHUB_REPOSITORY: undefined,
        GITHUB_REF_NAME: undefined,
        GITHUB_WORKSPACE: undefined
    };

    beforeEach(() => {
        for (const key of ENV_KEYS) {
            saved[key] = process.env[key];
            delete process.env[key];
        }
    });

    afterEach(() => {
        for (const key of ENV_KEYS) {
            if (saved[key] == null) {
                delete process.env[key];
            } else {
                process.env[key] = saved[key];
            }
        }
    });

    function setEnv(workspace: string): void {
        process.env.GITHUB_SERVER_URL = "https://github.com";
        process.env.GITHUB_REPOSITORY = "acme/config";
        process.env.GITHUB_REF_NAME = "main";
        process.env.GITHUB_WORKSPACE = workspace;
    }

    it("returns null when absolutePath is undefined", () => {
        setEnv("/home/runner/work/config/config");
        expect(buildGeneratorsYmlUrl(undefined, 5)).toBeNull();
    });

    it("returns null when GITHUB_SERVER_URL is missing", () => {
        setEnv("/home/runner/work/config/config");
        delete process.env.GITHUB_SERVER_URL;
        expect(buildGeneratorsYmlUrl("/home/runner/work/config/config/fern/generators.yml", 5)).toBeNull();
    });

    it("returns null when GITHUB_REPOSITORY is missing", () => {
        setEnv("/home/runner/work/config/config");
        delete process.env.GITHUB_REPOSITORY;
        expect(buildGeneratorsYmlUrl("/home/runner/work/config/config/fern/generators.yml", 5)).toBeNull();
    });

    it("returns null when GITHUB_REF_NAME is missing", () => {
        setEnv("/home/runner/work/config/config");
        delete process.env.GITHUB_REF_NAME;
        expect(buildGeneratorsYmlUrl("/home/runner/work/config/config/fern/generators.yml", 5)).toBeNull();
    });

    it("returns null when GITHUB_WORKSPACE is missing", () => {
        setEnv("/home/runner/work/config/config");
        delete process.env.GITHUB_WORKSPACE;
        expect(buildGeneratorsYmlUrl("/home/runner/work/config/config/fern/generators.yml", 5)).toBeNull();
    });

    it("returns null when the absolutePath is outside the workspace checkout", () => {
        setEnv("/home/runner/work/config/config");
        expect(buildGeneratorsYmlUrl("/tmp/other/generators.yml", 5)).toBeNull();
    });

    it("returns null when absolutePath equals workspace with a shared prefix (prevents sibling-dir match)", () => {
        // Defends against a naïve implementation that used String.prototype.startsWith without
        // the trailing slash — `/home/runner/work/config` would match `/home/runner/work/config2`.
        setEnv("/home/runner/work/config");
        expect(buildGeneratorsYmlUrl("/home/runner/work/config2/fern/generators.yml", 5)).toBeNull();
    });

    it("builds a blob URL with the workspace-relative path and line anchor", () => {
        setEnv("/home/runner/work/config/config");
        expect(buildGeneratorsYmlUrl("/home/runner/work/config/config/fern/generators.yml", 5)).toBe(
            "https://github.com/acme/config/blob/main/fern/generators.yml#L5"
        );
    });

    it("omits the line anchor when lineNumber is undefined", () => {
        setEnv("/home/runner/work/config/config");
        expect(buildGeneratorsYmlUrl("/home/runner/work/config/config/fern/generators.yml", undefined)).toBe(
            "https://github.com/acme/config/blob/main/fern/generators.yml"
        );
    });

    it("handles a trailing-slash workspace path without doubling the separator", () => {
        setEnv("/home/runner/work/config/config/");
        expect(buildGeneratorsYmlUrl("/home/runner/work/config/config/fern/apis/foo/generators.yml", 18)).toBe(
            "https://github.com/acme/config/blob/main/fern/apis/foo/generators.yml#L18"
        );
    });

    it("honors non-default GITHUB_SERVER_URL (self-hosted Enterprise)", () => {
        setEnv("/workspace");
        process.env.GITHUB_SERVER_URL = "https://github.acme-corp.internal";
        expect(buildGeneratorsYmlUrl("/workspace/generators.yml", 3)).toBe(
            "https://github.acme-corp.internal/acme/config/blob/main/generators.yml#L3"
        );
    });

    it("honors branch refs with slashes (e.g. feature/foo)", () => {
        setEnv("/workspace");
        process.env.GITHUB_REF_NAME = "feature/deep-branch";
        expect(buildGeneratorsYmlUrl("/workspace/fern/generators.yml", 1)).toBe(
            "https://github.com/acme/config/blob/feature/deep-branch/fern/generators.yml#L1"
        );
    });
});
