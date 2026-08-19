import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectCiProvider, detectInvocationSource } from "../detectInvocationSource.js";

const CI_ENV_VARS = [
    "CI",
    "CONTINUOUS_INTEGRATION",
    "FERN_INVOKER",
    "GITHUB_ACTIONS",
    "GITLAB_CI",
    "CIRCLECI",
    "TRAVIS",
    "JENKINS_URL",
    "JENKINS_HOME",
    "TF_BUILD",
    "BUILDKITE",
    "CODEBUILD_BUILD_ID",
    "TEAMCITY_VERSION",
    "BITBUCKET_BUILD_NUMBER",
    "DRONE",
    "SEMAPHORE",
    "APPVEYOR",
    "BUDDY_WORKSPACE_ID",
    "WERCKER_RUN_ID"
];

function clearCiEnvVars(): void {
    for (const key of CI_ENV_VARS) {
        delete process.env[key];
    }
}

describe("detectInvocationSource", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        clearCiEnvVars();
    });

    afterEach(() => {
        // Restore original env to avoid polluting other tests in the worker.
        process.env = { ...originalEnv };
    });

    it("returns value from FERN_INVOKER when set to a known value", () => {
        process.env.FERN_INVOKER = "autorelease";
        expect(detectInvocationSource()).toBe("autorelease");
    });

    it("normalizes FERN_INVOKER casing and whitespace", () => {
        process.env.FERN_INVOKER = "  AutoPilot ";
        expect(detectInvocationSource()).toBe("autopilot");
    });

    it("accepts all known InvocationSource values from FERN_INVOKER", () => {
        for (const value of ["autopilot", "autorelease", "ci", "manual"] as const) {
            process.env.FERN_INVOKER = value;
            expect(detectInvocationSource()).toBe(value);
        }
    });

    it("FERN_INVOKER takes precedence over CI env vars", () => {
        process.env.FERN_INVOKER = "autorelease";
        process.env.GITHUB_ACTIONS = "true";
        expect(detectInvocationSource()).toBe("autorelease");
    });

    it("falls back to 'ci' when FERN_INVOKER is unset but a CI env var is set", () => {
        process.env.GITHUB_ACTIONS = "true";
        expect(detectInvocationSource()).toBe("ci");
    });

    it("falls back to 'ci' when FERN_INVOKER holds an unknown value but CI is detected", () => {
        process.env.FERN_INVOKER = "something-else";
        process.env.CI = "true";
        expect(detectInvocationSource()).toBe("ci");
    });

    it("returns 'manual' when neither FERN_INVOKER nor any CI env var is set", () => {
        expect(detectInvocationSource()).toBe("manual");
    });
});

describe("detectCiProvider", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        clearCiEnvVars();
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it.each([
        ["GITHUB_ACTIONS", "true", "github"],
        ["GITLAB_CI", "true", "gitlab"],
        ["BITBUCKET_BUILD_NUMBER", "42", "bitbucket"],
        ["CIRCLECI", "true", "circleci"],
        ["TRAVIS", "true", "travis"],
        ["JENKINS_URL", "https://jenkins.example.com", "jenkins"],
        ["TF_BUILD", "True", "azure-pipelines"],
        ["BUILDKITE", "true", "buildkite"],
        ["CODEBUILD_BUILD_ID", "build:1", "codebuild"],
        ["TEAMCITY_VERSION", "2024.1", "teamcity"],
        ["DRONE", "true", "drone"],
        ["SEMAPHORE", "true", "semaphore"],
        ["APPVEYOR", "true", "appveyor"]
    ])("returns the right provider when %s is set", (envVar, value, expected) => {
        process.env[envVar] = value;
        expect(detectCiProvider()).toBe(expected);
    });

    it("returns 'jenkins' when JENKINS_HOME is set without JENKINS_URL", () => {
        process.env.JENKINS_HOME = "/var/jenkins_home";
        expect(detectCiProvider()).toBe("jenkins");
    });

    it("returns 'unknown' when a generic CI env var is set without a known provider", () => {
        process.env.CI = "true";
        expect(detectCiProvider()).toBe("unknown");
    });

    it("returns undefined when no CI env var is set", () => {
        expect(detectCiProvider()).toBeUndefined();
    });

    it("does not return any repository, run, branch, or actor information", () => {
        // Setting identifying metadata that earlier iterations used to expose must not
        // change the return value — we only report provider names.
        process.env.GITHUB_ACTIONS = "true";
        process.env.GITHUB_REPOSITORY = "private-org/private-repo";
        process.env.GITHUB_ACTOR = "private-user";
        process.env.GITHUB_RUN_ID = "12345";

        expect(detectCiProvider()).toBe("github");
    });
});
