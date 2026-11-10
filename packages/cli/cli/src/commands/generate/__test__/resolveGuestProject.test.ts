import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { describeClaimLink, resolveGuestProject } from "../resolveGuestProject.js";
import { createTestCliContext, createTestProject, type TestProject } from "./commandHarness.js";

const auth = vi.hoisted(() => ({
    getToken: vi.fn(),
    getOrCreateGuestSession: vi.fn()
}));
vi.mock("@fern-api/auth", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/auth")>();
    return { ...actual, getToken: auth.getToken, getOrCreateGuestSession: auth.getOrCreateGuestSession };
});

const OPENAPI = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /pet:
    get:
      operationId: listPets
      responses:
        "200": { description: ok }
`;

const GUEST_TOKEN = {
    type: "guest" as const,
    value: "guest-jwt",
    sessionId: "gs_123",
    organizationId: "guest-gs_123",
    claimUrl: "https://dashboard.buildwithfern.com/claim/gs_123#secret",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
};

describe("resolveGuestProject", () => {
    let testProject: TestProject;

    beforeEach(async () => {
        testProject = await createTestProject({
            "fern.config.json": '{"organization":"acme","version":"*"}',
            "openapi/openapi.yml": OPENAPI,
            "generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n"
        });
        auth.getToken.mockReset();
        auth.getOrCreateGuestSession.mockReset();
    });

    afterEach(async () => {
        await testProject.cleanup();
    });

    it("refuses to run as a guest while FERN_TOKEN is set", async () => {
        auth.getToken.mockResolvedValue({ type: "organization", value: "fern_org_token" });
        const { cliContext, logged } = createTestCliContext();

        // The harness's failAndThrow logs the message and aborts the task.
        await expect(resolveGuestProject({ project: testProject.project, cliContext, work: "sdk" })).rejects.toThrow();
        expect(logged("--guest cannot be combined with FERN_TOKEN")).toBe(true);
        expect(auth.getOrCreateGuestSession).not.toHaveBeenCalled();
    });

    it("refuses to run as a guest while a login is saved", async () => {
        auth.getToken.mockResolvedValue({ type: "user", value: "user-jwt" });
        const { cliContext, logged } = createTestCliContext();

        await expect(resolveGuestProject({ project: testProject.project, cliContext, work: "sdk" })).rejects.toThrow();
        expect(logged("--guest cannot be combined with a saved login")).toBe(true);
        expect(auth.getOrCreateGuestSession).not.toHaveBeenCalled();
    });

    it("swaps the organization for the guest org for this run and prints the claim link", async () => {
        auth.getToken.mockResolvedValue(undefined);
        auth.getOrCreateGuestSession.mockResolvedValue({ token: GUEST_TOKEN, reused: false });
        const { cliContext, logged } = createTestCliContext();

        const resolved = await resolveGuestProject({ project: testProject.project, cliContext, work: "sdk" });

        expect(resolved.token).toBe(GUEST_TOKEN);
        expect(resolved.project.config.organization).toBe("guest-gs_123");
        expect(resolved.project.config._absolutePath).toBe(testProject.project.config._absolutePath);
        expect(testProject.project.config.organization).toBe("acme");
        expect(auth.getOrCreateGuestSession).toHaveBeenCalledWith(
            expect.objectContaining({
                absolutePathToFernDirectory: expect.stringMatching(/\/fern$/),
                cliVersion: "0.0.0"
            })
        );
        expect(logged("Started guest session")).toBe(true);
        // The link says the run made an SDK, so the dashboard lands the claim on the organization's SDKs.
        expect(logged("https://dashboard.buildwithfern.com/claim/gs_123?from=sdk#secret")).toBe(true);
        expect(logged('Ignoring organization "acme"')).toBe(true);
    });

    it("says when it reuses the repo's existing session", async () => {
        auth.getToken.mockResolvedValue(undefined);
        auth.getOrCreateGuestSession.mockResolvedValue({ token: GUEST_TOKEN, reused: true });
        const { cliContext, logged } = createTestCliContext();

        await resolveGuestProject({ project: testProject.project, cliContext, work: "sdk" });

        expect(logged("Reusing guest session")).toBe(true);
    });

    it("mints a new session with --new-session and says so", async () => {
        auth.getToken.mockResolvedValue(undefined);
        auth.getOrCreateGuestSession.mockResolvedValue({ token: GUEST_TOKEN, reused: false });
        const { cliContext, logged } = createTestCliContext();

        await resolveGuestProject({ project: testProject.project, cliContext, work: "sdk", newSession: true });

        expect(auth.getOrCreateGuestSession).toHaveBeenCalledWith(expect.objectContaining({ forceNew: true }));
        expect(logged("Started a new (--new-session) guest session")).toBe(true);
    });

    it("warns when the session expires within the hour, without rotating it", async () => {
        auth.getToken.mockResolvedValue(undefined);
        const now = new Date("2026-10-27T12:00:00Z");
        const soon = { ...GUEST_TOKEN, expiresAt: new Date(now.getTime() + 25 * 60 * 1000) };
        auth.getOrCreateGuestSession.mockResolvedValue({ token: soon, reused: true });
        const { cliContext, logged } = createTestCliContext();

        const resolved = await resolveGuestProject({ project: testProject.project, cliContext, work: "sdk", now });

        expect(resolved.token).toBe(soon);
        expect(logged("expires in 25 minutes")).toBe(true);
        expect(auth.getOrCreateGuestSession).toHaveBeenCalledWith(expect.objectContaining({ forceNew: false }));
    });

    it("does not warn while plenty of time is left", async () => {
        auth.getToken.mockResolvedValue(undefined);
        auth.getOrCreateGuestSession.mockResolvedValue({ token: GUEST_TOKEN, reused: true });
        const { cliContext, logged } = createTestCliContext();

        await resolveGuestProject({ project: testProject.project, cliContext, work: "sdk" });

        expect(logged("expires in")).toBe(false);
    });
});

describe("describeClaimLink", () => {
    it("adds what the run made before the secret", () => {
        expect(describeClaimLink("https://dashboard.buildwithfern.com/claim/gs_123#secret", "sdk")).toBe(
            "https://dashboard.buildwithfern.com/claim/gs_123?from=sdk#secret"
        );
        expect(describeClaimLink("https://dashboard-dev.buildwithfern.com/claim/gs_123#secret", "docs")).toBe(
            "https://dashboard-dev.buildwithfern.com/claim/gs_123?from=docs#secret"
        );
    });

    it("keeps a link it cannot parse as it is", () => {
        expect(describeClaimLink("not a link", "sdk")).toBe("not a link");
    });
});
