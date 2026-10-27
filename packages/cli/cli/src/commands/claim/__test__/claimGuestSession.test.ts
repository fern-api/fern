import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { GUEST_SESSION_POINTER_FILENAME, getPathToGuestSessionFile, writeStoredGuestSession } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestCliContext, createTestProject, type TestProject } from "../../generate/__test__/commandHarness.js";
import { type ClaimResult, claimGuestSession } from "../claimGuestSession.js";

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
        const { cliContext, logged } = createTestCliContext();

        await claimGuestSession({
            cliContext,
            organization: "acme",
            absolutePathToFernDirectory: fernDirectory,
            claim
        });

        expect(claim).toHaveBeenCalledWith({
            venusOrigin: "https://venus.buildwithfern.com",
            token: "user-jwt",
            sessionId: "gs_123",
            claimSecret: "the-secret",
            organizationId: "acme"
        });
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
                claim
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
                claim
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
                claim
            })
        ).rejects.toThrow();

        expect(logged("nothing left to claim")).toBe(true);
        expect(logged("Start a new session")).toBe(true);
        expect(JSON.parse(await readFile(path.join(fernDirectory, "fern.config.json"), "utf-8")).organization).toBe(
            "guest-gs_123"
        );
        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(true);
    });
});
