import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { GUEST_SESSION_POINTER_FILENAME, getPathToGuestSessionFile, writeStoredGuestSession } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestCliContext, createTestProject, type TestProject } from "../../generate/__test__/commandHarness.js";
import {
    type ClaimResult,
    claimGuestSession,
    type MoveDocs,
    type MoveSdks,
    type ReadSession
} from "../claimGuestSession.js";

const fakeHome = vi.hoisted(() => ({ path: "" }));
vi.mock("os", async (importOriginal) => {
    const actual = await importOriginal<typeof import("os")>();
    return { ...actual, homedir: () => fakeHome.path };
});

const login = vi.hoisted(() => ({ askToLogin: vi.fn() }));
vi.mock("@fern-api/login", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/login")>();
    return { ...actual, askToLogin: login.askToLogin };
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

const SESSION = {
    sessionId: "gs_123",
    organizationId: "guest-gs_123",
    token: "guest-jwt",
    claimUrl: "https://dashboard.buildwithfern.com/claim/gs_123#the-secret",
    expiresAt: "2099-01-01T00:00:00.000Z",
    venusOrigin: "https://venus.buildwithfern.com"
};

async function exists(file: string): Promise<boolean> {
    return stat(file).then(
        () => true,
        () => false
    );
}

const unclaimed: ReadSession = async () => ({ kind: "unclaimed" });
const movedDocs: MoveDocs = async () => ({ kind: "moved", sites: [] });
const movedSdks: MoveSdks = async () => ({ kind: "moved", buildIds: [] });

describe("claimGuestSession", () => {
    let home: string;
    let testProject: TestProject;
    let fernDirectory: AbsoluteFilePath;

    beforeEach(async () => {
        home = await mkdtemp(path.join(tmpdir(), "fern-claim-home-"));
        fakeHome.path = home;
        testProject = await createTestProject({
            "fern.config.json": '{"organization":"guest-gs_123","version":"*"}',
            "openapi/openapi.yml": OPENAPI,
            "generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n"
        });
        fernDirectory = AbsoluteFilePath.of(path.join(testProject.directory, "fern"));
        await writeStoredGuestSession({ session: SESSION, absolutePathToFernDirectory: fernDirectory });
        login.askToLogin.mockReset();
        login.askToLogin.mockResolvedValue({ type: "user", value: "user-jwt" });
    });

    afterEach(async () => {
        await testProject.cleanup();
        await rm(home, { recursive: true, force: true });
    });

    it("claims with the stored secret, rewrites fern.config.json and forgets the session", async () => {
        const claim = vi
            .fn<(request: unknown) => Promise<ClaimResult>>()
            .mockResolvedValue({ ok: true, organizationId: "acme", nextSteps: ["Run fern login"] });
        const moveDocs = vi.fn<MoveDocs>().mockResolvedValue({
            kind: "moved",
            sites: [{ domain: "pets.docs.buildwithfern.com", previousDomain: "drop-abc.docs.buildwithfern.com" }]
        });
        const moveSdks = vi.fn<MoveSdks>().mockResolvedValue({ kind: "moved", buildIds: ["b1", "b2"] });
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            "# the site\ninstances:\n  - url: example.docs.buildwithfern.com\n    edit-this-page: true\ntitle: Pets\n"
        );
        const { cliContext, logged } = createTestCliContext();

        await claimGuestSession({
            docsUrl: "pets",
            sdkName: "pets-sdk",
            cliContext,
            organization: "acme",
            absolutePathToFernDirectory: fernDirectory,
            claim,
            readSession: unclaimed,
            moveDocs,
            moveSdks
        });

        expect(claim).toHaveBeenCalledWith({
            venusOrigin: "https://venus.buildwithfern.com",
            token: "user-jwt",
            sessionId: "gs_123",
            claimSecret: "the-secret",
            organizationId: "acme"
        });
        expect(moveDocs).toHaveBeenCalledWith({
            token: "user-jwt",
            guestOrganizationId: "guest-gs_123",
            docsUrl: "pets"
        });
        expect(moveSdks).toHaveBeenCalledWith({
            token: "user-jwt",
            organizationId: "acme",
            guestOrganizationId: "guest-gs_123",
            sdkName: "pets-sdk"
        });
        expect(logged("Docs site moved to https://pets.docs.buildwithfern.com")).toBe(true);
        expect(await readFile(path.join(fernDirectory, "docs.yml"), "utf-8")).toBe(
            "# the site\ninstances:\n  - url: pets.docs.buildwithfern.com\n    edit-this-page: true\ntitle: Pets\n"
        );
        expect(logged("Moved 2 SDK build(s) into acme")).toBe(true);
        expect(JSON.parse(await readFile(path.join(fernDirectory, "fern.config.json"), "utf-8"))).toEqual({
            organization: "acme",
            version: "*"
        });
        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(false);
        expect(await exists(getPathToGuestSessionFile("gs_123"))).toBe(false);
        expect(logged("Claimed guest session gs_123 into organization acme")).toBe(true);
        expect(logged("Run fern login")).toBe(true);
    });

    it("refuses to claim with an organization token", async () => {
        login.askToLogin.mockResolvedValue({ type: "organization", value: "fern_org_token" });
        const claim = vi.fn();
        const { cliContext, logged } = createTestCliContext();

        await expect(
            claimGuestSession({
                cliContext,
                organization: undefined,
                absolutePathToFernDirectory: fernDirectory,
                claim,
                readSession: unclaimed,
                moveDocs: movedDocs,
                moveSdks: movedSdks
            })
        ).rejects.toThrow();

        expect(claim).not.toHaveBeenCalled();
        expect(logged("Claiming needs a signed-in user")).toBe(true);
        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(true);
    });

    it("explains when the repo has no guest session", async () => {
        await rm(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME));
        const claim = vi.fn();
        const { cliContext, logged } = createTestCliContext();

        await expect(
            claimGuestSession({
                cliContext,
                organization: undefined,
                absolutePathToFernDirectory: fernDirectory,
                claim,
                readSession: unclaimed,
                moveDocs: movedDocs,
                moveSdks: movedSdks
            })
        ).rejects.toThrow();

        expect(claim).not.toHaveBeenCalled();
        expect(login.askToLogin).not.toHaveBeenCalled();
        expect(logged("No guest session is recorded for this repo")).toBe(true);
    });

    it("keeps the session and config when Venus says there is nothing left to claim", async () => {
        const claim = vi.fn<(request: unknown) => Promise<ClaimResult>>().mockResolvedValue({
            ok: false,
            statusCode: 410,
            message: "Start a new session: `fern generate --guest`."
        });
        const { cliContext, logged } = createTestCliContext();

        await expect(
            claimGuestSession({
                cliContext,
                organization: undefined,
                absolutePathToFernDirectory: fernDirectory,
                claim,
                readSession: unclaimed,
                moveDocs: movedDocs,
                moveSdks: movedSdks
            })
        ).rejects.toThrow();

        expect(logged("nothing left to claim")).toBe(true);
        expect(logged("Start a new session")).toBe(true);
        expect(JSON.parse(await readFile(path.join(fernDirectory, "fern.config.json"), "utf-8")).organization).toBe(
            "guest-gs_123"
        );
        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(true);
    });

    it("keeps the session when a move fails, and a rerun only retries the moves", async () => {
        const claim = vi
            .fn<(request: unknown) => Promise<ClaimResult>>()
            .mockResolvedValue({ ok: true, organizationId: "acme", nextSteps: [] });
        const moveDocs = vi
            .fn<MoveDocs>()
            .mockResolvedValueOnce({ kind: "failed", statusCode: 409, reason: "domain_taken" })
            .mockResolvedValueOnce({
                kind: "moved",
                sites: [{ domain: "pets2.docs.buildwithfern.com", previousDomain: undefined }]
            });
        const first = createTestCliContext();

        await expect(
            claimGuestSession({
                cliContext: first.cliContext,
                organization: "acme",
                docsUrl: "pets",
                absolutePathToFernDirectory: fernDirectory,
                claim,
                readSession: unclaimed,
                moveDocs,
                moveSdks: movedSdks
            })
        ).rejects.toThrow();

        expect(first.logged("pets is already taken")).toBe(true);
        expect(first.logged("Run `fern claim` again to retry")).toBe(true);
        expect(JSON.parse(await readFile(path.join(fernDirectory, "fern.config.json"), "utf-8")).organization).toBe(
            "acme"
        );
        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(true);

        const second = createTestCliContext();
        await claimGuestSession({
            cliContext: second.cliContext,
            organization: undefined,
            docsUrl: "pets2",
            absolutePathToFernDirectory: fernDirectory,
            claim,
            readSession: async () => ({ kind: "claimed", organizationId: "acme" }),
            moveDocs,
            moveSdks: movedSdks
        });

        expect(claim).toHaveBeenCalledTimes(1);
        expect(second.logged("already claimed into acme")).toBe(true);
        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(false);
    });

    it("finishes without moving SDK builds when no sdk-gen-api is configured", async () => {
        const claim = vi
            .fn<(request: unknown) => Promise<ClaimResult>>()
            .mockResolvedValue({ ok: true, organizationId: "guest-gs_123", nextSteps: [] });
        const { cliContext } = createTestCliContext();

        await claimGuestSession({
            cliContext,
            organization: undefined,
            absolutePathToFernDirectory: fernDirectory,
            claim,
            readSession: unclaimed,
            moveDocs: movedDocs,
            moveSdks: async () => ({ kind: "not_configured" })
        });

        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(false);
    });
});
