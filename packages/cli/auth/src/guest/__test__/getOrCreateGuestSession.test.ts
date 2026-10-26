import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import type { FernVenusApi } from "@fern-api/venus-api-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fakeHome = vi.hoisted(() => ({ path: "" }));
vi.mock("os", async (importOriginal) => {
    const actual = await importOriginal<typeof import("os")>();
    return { ...actual, homedir: () => fakeHome.path };
});

import { GUEST_SESSION_POINTER_FILENAME, getPathToGuestSessionFile, isGuestSessionLive } from "../GuestSession.js";
import { getOrCreateGuestSession } from "../getOrCreateGuestSession.js";

const NOW = new Date("2026-10-26T12:00:00Z");

function venusResponse(
    overrides: Partial<FernVenusApi.CreateGuestSessionResponse> = {}
): FernVenusApi.CreateGuestSessionResponse {
    return {
        sessionId: "gs_123",
        organizationId: "guest-gs_123",
        token: "guest-jwt",
        claimSecret: "secret",
        claimUrl: "https://dashboard.buildwithfern.com/claim/gs_123#secret",
        expiresAt: new Date("2026-10-27T12:00:00Z"),
        limits: { sdkBuilds: 5, docsPublishes: 10, used: { sdkBuilds: 0, docsPublishes: 0 } },
        operations: ["sdk-build", "docs-publish"],
        ...overrides
    };
}

describe("getOrCreateGuestSession", () => {
    let home: string;
    let fernDirectory: AbsoluteFilePath;

    beforeEach(async () => {
        home = await mkdtemp(path.join(tmpdir(), "fern-guest-home-"));
        fakeHome.path = home;
        const repo = await mkdtemp(path.join(tmpdir(), "fern-guest-repo-"));
        fernDirectory = AbsoluteFilePath.of(path.join(repo, "fern"));
        await mkdir(fernDirectory, { recursive: true });
    });

    afterEach(async () => {
        await rm(home, { recursive: true, force: true });
        await rm(path.dirname(fernDirectory), { recursive: true, force: true });
    });

    it("mints a session, stores it with 0600 and points the repo at it", async () => {
        const createGuestSession = vi.fn().mockResolvedValue(venusResponse());

        const result = await getOrCreateGuestSession({
            absolutePathToFernDirectory: fernDirectory,
            cliVersion: "1.2.3",
            context: createMockTaskContext(),
            createGuestSession,
            now: NOW
        });

        expect(result.reused).toBe(false);
        expect(result.token).toMatchObject({
            type: "guest",
            value: "guest-jwt",
            sessionId: "gs_123",
            organizationId: "guest-gs_123",
            claimUrl: "https://dashboard.buildwithfern.com/claim/gs_123#secret"
        });
        expect(createGuestSession).toHaveBeenCalledWith({
            fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
            clientVersion: "1.2.3"
        });

        const pointer = await readFile(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME), "utf-8");
        expect(pointer.trim()).toBe("gs_123");
        expect(await readFile(path.join(fernDirectory, ".gitignore"), "utf-8")).toContain(
            GUEST_SESSION_POINTER_FILENAME
        );

        const sessionFile = getPathToGuestSessionFile("gs_123");
        expect(sessionFile.startsWith(path.join(home, ".fern"))).toBe(true);
        expect((await stat(sessionFile)).mode & 0o777).toBe(0o600);
        expect(JSON.parse(await readFile(sessionFile, "utf-8"))).toMatchObject({
            sessionId: "gs_123",
            token: "guest-jwt",
            expiresAt: "2026-10-27T12:00:00.000Z"
        });
    });

    it("appends to an existing .gitignore without duplicating the entry", async () => {
        await writeFile(path.join(fernDirectory, ".gitignore"), "**/.preview\n**/.definition");
        const createGuestSession = vi.fn().mockResolvedValue(venusResponse());
        const run = () =>
            getOrCreateGuestSession({
                absolutePathToFernDirectory: fernDirectory,
                cliVersion: "1.2.3",
                context: createMockTaskContext(),
                createGuestSession,
                now: NOW
            });

        await run();
        await run();

        const gitignore = await readFile(path.join(fernDirectory, ".gitignore"), "utf-8");
        expect(gitignore).toBe(`**/.preview\n**/.definition\n${GUEST_SESSION_POINTER_FILENAME}\n`);
    });

    it("reuses a live session from the same repo without calling Venus", async () => {
        const createGuestSession = vi.fn().mockResolvedValue(venusResponse());
        const args = {
            absolutePathToFernDirectory: fernDirectory,
            cliVersion: "1.2.3",
            context: createMockTaskContext(),
            createGuestSession,
            now: NOW
        };

        const first = await getOrCreateGuestSession(args);
        const second = await getOrCreateGuestSession(args);

        expect(createGuestSession).toHaveBeenCalledTimes(1);
        expect(second.reused).toBe(true);
        expect(second.token).toEqual(first.token);
    });

    it("mints a new session once the stored one has expired", async () => {
        const createGuestSession = vi
            .fn()
            .mockResolvedValueOnce(venusResponse({ sessionId: "gs_old", organizationId: "guest-gs_old" }))
            .mockResolvedValueOnce(venusResponse({ sessionId: "gs_new", organizationId: "guest-gs_new" }));
        const args = {
            absolutePathToFernDirectory: fernDirectory,
            cliVersion: "1.2.3",
            context: createMockTaskContext(),
            createGuestSession
        };

        await getOrCreateGuestSession({ ...args, now: NOW });
        const later = await getOrCreateGuestSession({ ...args, now: new Date("2026-10-28T00:00:00Z") });

        expect(createGuestSession).toHaveBeenCalledTimes(2);
        expect(later.reused).toBe(false);
        expect(later.token.sessionId).toBe("gs_new");
        const pointer = await readFile(path.join(fernDirectory, GUEST_SESSION_POINTER_FILENAME), "utf-8");
        expect(pointer.trim()).toBe("gs_new");
    });

    it("fails with an auth error when Venus refuses to issue a session", async () => {
        const createGuestSession = vi
            .fn()
            .mockRejectedValue(new Error("Guest sessions are paused. Sign in to continue: `fern login`."));

        await expect(
            getOrCreateGuestSession({
                absolutePathToFernDirectory: fernDirectory,
                cliVersion: "1.2.3",
                context: createMockTaskContext(),
                createGuestSession,
                now: NOW
            })
        ).rejects.toThrow();
        expect(createGuestSession).toHaveBeenCalledTimes(1);
    });
});

describe("isGuestSessionLive", () => {
    it("is false at or after expiry and for unparseable dates", () => {
        expect(isGuestSessionLive({ expiresAt: "2026-10-27T12:00:00Z" }, NOW)).toBe(true);
        expect(isGuestSessionLive({ expiresAt: "2026-10-26T12:00:00Z" }, NOW)).toBe(false);
        expect(isGuestSessionLive({ expiresAt: "not-a-date" }, NOW)).toBe(false);
    });
});
