import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { detectDeployerAuthor } from "../environment.js";

describe("detectDeployerAuthor", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        // Clear all CI-related env vars
        delete process.env.GITHUB_ACTOR;
        delete process.env.GITLAB_USER_LOGIN;
        delete process.env.CIRCLE_USERNAME;
        delete process.env.BUILD_REQUESTEDFOR;
        delete process.env.GITLAB_USER_EMAIL;
        delete process.env.BUILD_REQUESTEDFOREMAIL;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("returns undefined when no CI env vars are set", () => {
        expect(detectDeployerAuthor()).toBeUndefined();
    });

    it("detects GitHub Actions actor", () => {
        process.env.GITHUB_ACTOR = "alice";
        expect(detectDeployerAuthor()).toEqual({ username: "alice", email: undefined });
    });

    it("detects GitLab CI username and email", () => {
        process.env.GITLAB_USER_LOGIN = "bob";
        process.env.GITLAB_USER_EMAIL = "bob@example.com";
        expect(detectDeployerAuthor()).toEqual({ username: "bob", email: "bob@example.com" });
    });

    it("detects CircleCI username", () => {
        process.env.CIRCLE_USERNAME = "carol";
        expect(detectDeployerAuthor()).toEqual({ username: "carol", email: undefined });
    });

    it("detects Azure DevOps username and email", () => {
        process.env.BUILD_REQUESTEDFOR = "dave";
        process.env.BUILD_REQUESTEDFOREMAIL = "dave@example.com";
        expect(detectDeployerAuthor()).toEqual({ username: "dave", email: "dave@example.com" });
    });

    it("prefers GITHUB_ACTOR over other username vars", () => {
        process.env.GITHUB_ACTOR = "alice";
        process.env.GITLAB_USER_LOGIN = "bob";
        expect(detectDeployerAuthor()?.username).toBe("alice");
    });

    it("prefers GITLAB_USER_EMAIL over BUILD_REQUESTEDFOREMAIL", () => {
        process.env.GITLAB_USER_EMAIL = "gitlab@example.com";
        process.env.BUILD_REQUESTEDFOREMAIL = "azure@example.com";
        expect(detectDeployerAuthor()?.email).toBe("gitlab@example.com");
    });

    it("treats empty strings as absent", () => {
        process.env.GITHUB_ACTOR = "";
        process.env.GITLAB_USER_EMAIL = "";
        expect(detectDeployerAuthor()).toBeUndefined();
    });

    it("returns email only when no username var is set", () => {
        process.env.GITLAB_USER_EMAIL = "anon@example.com";
        expect(detectDeployerAuthor()).toEqual({ username: undefined, email: "anon@example.com" });
    });
});
