import { describe, expect, it } from "vitest";

import { detectSdkGenApiCi, parseGitRemoteUrl } from "../sdkGenApiProvenance";

describe("parseGitRemoteUrl", () => {
    it.each([
        ["git@github.com:acme/fern-config.git", { host: "github.com", owner: "acme", repo: "fern-config" }],
        ["https://github.com/acme/fern-config.git", { host: "github.com", owner: "acme", repo: "fern-config" }],
        ["https://github.com/acme/fern-config", { host: "github.com", owner: "acme", repo: "fern-config" }],
        [
            "ssh://git@ghe.acme.dev/platform/api-config.git",
            { host: "ghe.acme.dev", owner: "platform", repo: "api-config" }
        ],
        ["https://gitlab.com/acme/group/fern.git", { host: "gitlab.com", owner: "acme", repo: "group/fern" }]
    ])("reads %s", (url, expected) => {
        expect(parseGitRemoteUrl(url)).toEqual(expected);
    });

    it("says nothing of a remote it cannot read", () => {
        expect(parseGitRemoteUrl("not a url")).toBeUndefined();
        expect(parseGitRemoteUrl("https://github.com/acme")).toBeUndefined();
    });
});

describe("detectSdkGenApiCi", () => {
    it("names a GitHub Actions run, its link and its actor", () => {
        expect(
            detectSdkGenApiCi({
                GITHUB_ACTIONS: "true",
                GITHUB_SERVER_URL: "https://github.com",
                GITHUB_REPOSITORY: "acme/fern-config",
                GITHUB_RUN_ID: "42",
                GITHUB_ACTOR: "octocat"
            })
        ).toEqual({
            source: "github",
            runUrl: "https://github.com/acme/fern-config/actions/runs/42",
            actor: "octocat"
        });
    });

    it("names other CI systems by the variables they set", () => {
        expect(detectSdkGenApiCi({ GITLAB_CI: "true", CI_PIPELINE_URL: "https://gitlab.com/p/1" })).toEqual({
            source: "gitlab",
            runUrl: "https://gitlab.com/p/1"
        });
        expect(detectSdkGenApiCi({ CI: "true" })).toEqual({ source: "other" });
    });

    it("is undefined on a local run", () => {
        expect(detectSdkGenApiCi({})).toBeUndefined();
    });
});
