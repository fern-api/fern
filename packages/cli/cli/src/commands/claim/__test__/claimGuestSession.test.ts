import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { GUEST_SESSION_POINTER_FILENAME, getPathToGuestSessionFile, writeStoredGuestSession } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestCliContext, createTestProject, type TestProject } from "../../generate/__test__/commandHarness.js";
import { claimGuestSession, type SessionState } from "../claimGuestSession.js";

const fakeHome = vi.hoisted(() => ({ path: "" }));
vi.mock("os", async (importOriginal) => {
    const actual = await importOriginal<typeof import("os")>();
    return { ...actual, homedir: () => fakeHome.path };
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
    });

    afterEach(async () => {
        await testProject.cleanup();
        await rm(home, { recursive: true, force: true });
    });

    function sessionStates(...states: SessionState[]) {
        const readSession = vi.fn<(request: unknown) => Promise<SessionState>>();
        for (const state of states) {
            readSession.mockResolvedValueOnce(state);
        }
        return readSession;
    }

    async function guestSessionIsKept(): Promise<boolean> {
        return (
            (await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))) &&
            (await exists(getPathToGuestSessionFile("gs_123")))
        );
    }

    async function configuredOrganization(): Promise<string> {
        return JSON.parse(await readFile(path.join(fernDirectory, "fern.config.json"), "utf-8")).organization;
    }

    it("opens the claim page, waits for the browser claim, then rewrites fern.config.json and forgets the session", async () => {
        const readSession = sessionStates(
            { kind: "unclaimed" },
            { kind: "unreachable", statusCode: 503 },
            { kind: "unclaimed" },
            { kind: "claimed", organizationId: "acme" }
        );
        const openBrowser = vi.fn().mockResolvedValue(undefined);
        const sleep = vi.fn().mockResolvedValue(undefined);
        const { cliContext, logged } = createTestCliContext();

        await claimGuestSession({
            cliContext,
            absolutePathToFernDirectory: fernDirectory,
            readSession,
            openBrowser,
            sleep
        });

        expect(openBrowser).toHaveBeenCalledWith(SESSION.claimUrl);
        expect(readSession).toHaveBeenCalledWith({
            venusOrigin: "https://venus.buildwithfern.com",
            sessionId: "gs_123",
            claimSecret: "the-secret"
        });
        expect(readSession).toHaveBeenCalledTimes(4);
        expect(sleep).toHaveBeenCalledTimes(3);
        expect(await configuredOrganization()).toBe("acme");
        expect(JSON.parse(await readFile(path.join(fernDirectory, "fern.config.json"), "utf-8"))).toEqual({
            organization: "acme",
            version: "*"
        });
        expect(await exists(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME))).toBe(false);
        expect(await exists(getPathToGuestSessionFile("gs_123"))).toBe(false);
        expect(logged("Claimed guest session gs_123 into organization acme")).toBe(true);
    });

    it("prints the link when no browser opens, and still waits for the claim", async () => {
        const readSession = sessionStates({ kind: "unclaimed" }, { kind: "claimed", organizationId: "acme" });
        const openBrowser = vi.fn().mockRejectedValue(new Error("no display"));
        const { cliContext, logged } = createTestCliContext();

        await claimGuestSession({
            cliContext,
            absolutePathToFernDirectory: fernDirectory,
            readSession,
            openBrowser,
            sleep: vi.fn().mockResolvedValue(undefined)
        });

        expect(logged(SESSION.claimUrl)).toBe(true);
        expect(logged("Couldn't open a browser automatically")).toBe(true);
        expect(await configuredOrganization()).toBe("acme");
    });

    it("finishes without opening the browser when the session was already claimed there", async () => {
        const readSession = sessionStates({ kind: "claimed", organizationId: "acme" });
        const openBrowser = vi.fn();
        const { cliContext } = createTestCliContext();

        await claimGuestSession({ cliContext, absolutePathToFernDirectory: fernDirectory, readSession, openBrowser });

        expect(openBrowser).not.toHaveBeenCalled();
        expect(await configuredOrganization()).toBe("acme");
        expect(await guestSessionIsKept()).toBe(false);
    });

    it("gives up after the timeout and keeps the session and config", async () => {
        const readSession = vi
            .fn<(request: unknown) => Promise<SessionState>>()
            .mockResolvedValue({ kind: "unclaimed" });
        let clock = 0;
        const { cliContext, logged } = createTestCliContext();

        await expect(
            claimGuestSession({
                cliContext,
                absolutePathToFernDirectory: fernDirectory,
                readSession,
                openBrowser: vi.fn().mockResolvedValue(undefined),
                sleep: async (ms) => {
                    clock += ms;
                },
                now: () => clock,
                pollIntervalMs: 1_000,
                timeoutMs: 5_000
            })
        ).rejects.toThrow();

        expect(logged("was not claimed within")).toBe(true);
        expect(await configuredOrganization()).toBe("guest-gs_123");
        expect(await guestSessionIsKept()).toBe(true);
    });

    it("keeps the session and config when Venus says it can no longer be claimed", async () => {
        const readSession = sessionStates({ kind: "unclaimed" }, { kind: "gone", status: "expired" });
        const { cliContext, logged } = createTestCliContext();

        await expect(
            claimGuestSession({
                cliContext,
                absolutePathToFernDirectory: fernDirectory,
                readSession,
                openBrowser: vi.fn().mockResolvedValue(undefined),
                sleep: vi.fn().mockResolvedValue(undefined)
            })
        ).rejects.toThrow();

        expect(logged("can no longer be claimed (expired)")).toBe(true);
        expect(await configuredOrganization()).toBe("guest-gs_123");
        expect(await guestSessionIsKept()).toBe(true);
    });

    it("explains when the repo has no guest session", async () => {
        await rm(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME));
        const readSession = vi.fn();
        const openBrowser = vi.fn();
        const { cliContext, logged } = createTestCliContext();

        await expect(
            claimGuestSession({ cliContext, absolutePathToFernDirectory: fernDirectory, readSession, openBrowser })
        ).rejects.toThrow();

        expect(readSession).not.toHaveBeenCalled();
        expect(openBrowser).not.toHaveBeenCalled();
        expect(logged("No guest session is recorded for this repo")).toBe(true);
    });
});
