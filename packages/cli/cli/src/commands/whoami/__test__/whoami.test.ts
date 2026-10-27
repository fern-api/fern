import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { writeStoredGuestSession } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestCliContext } from "../../generate/__test__/commandHarness.js";
import { buildWhoamiReport, formatWhoamiReport } from "../whoami.js";

const fakeHome = vi.hoisted(() => ({ path: "" }));
vi.mock("os", async (importOriginal) => {
    const actual = await importOriginal<typeof import("os")>();
    return { ...actual, homedir: () => fakeHome.path };
});

const auth = vi.hoisted(() => ({ getToken: vi.fn(), getCurrentUser: vi.fn() }));
vi.mock("@fern-api/auth", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/auth")>();
    return { ...actual, getToken: auth.getToken, getCurrentUser: auth.getCurrentUser };
});

const SESSION = {
    sessionId: "gs_123",
    organizationId: "guest-gs_123",
    token: "guest-jwt",
    claimUrl: "https://dashboard.buildwithfern.com/claim/gs_123#secret",
    expiresAt: "2099-01-01T00:00:00.000Z",
    venusOrigin: "https://venus.buildwithfern.com"
};

describe("whoami", () => {
    let home: string;
    let fernDirectory: AbsoluteFilePath;

    beforeEach(async () => {
        home = await mkdtemp(path.join(tmpdir(), "fern-whoami-home-"));
        fakeHome.path = home;
        const repo = await mkdtemp(path.join(tmpdir(), "fern-whoami-repo-"));
        fernDirectory = AbsoluteFilePath.of(path.join(repo, "fern"));
        await mkdir(fernDirectory, { recursive: true });
        auth.getToken.mockReset();
        auth.getCurrentUser.mockReset();
    });

    afterEach(async () => {
        await rm(home, { recursive: true, force: true });
        await rm(path.dirname(fernDirectory), { recursive: true, force: true });
    });

    it("reports a user login and the repo's live guest session without the token", async () => {
        auth.getToken.mockResolvedValue({ type: "user", value: "user-jwt" });
        auth.getCurrentUser.mockResolvedValue({ userId: "u_1", username: "naman", email: "naman@example.com" });
        await writeStoredGuestSession({ session: SESSION, absolutePathToFernDirectory: fernDirectory });
        const { cliContext } = createTestCliContext();

        const report = await buildWhoamiReport({ cliContext, absolutePathToFernDirectory: fernDirectory });

        expect(report).toEqual({
            login: { kind: "user", userId: "u_1", username: "naman", email: "naman@example.com" },
            guestSession: {
                sessionId: "gs_123",
                organizationId: "guest-gs_123",
                expiresAt: SESSION.expiresAt,
                claimUrl: SESSION.claimUrl,
                live: true,
                venusOrigin: SESSION.venusOrigin
            }
        });
        expect(JSON.stringify(report)).not.toContain("guest-jwt");
        const text = formatWhoamiReport(report).join("\n");
        expect(text).toContain("naman@example.com");
        expect(text).toContain("gs_123");
        expect(text).toContain(SESSION.claimUrl);
    });

    it("reports an organization token and an expired session", async () => {
        auth.getToken.mockResolvedValue({ type: "organization", value: "fern_org" });
        await writeStoredGuestSession({
            session: { ...SESSION, expiresAt: "2000-01-01T00:00:00.000Z" },
            absolutePathToFernDirectory: fernDirectory
        });
        const { cliContext } = createTestCliContext();

        const report = await buildWhoamiReport({ cliContext, absolutePathToFernDirectory: fernDirectory });

        expect(report.login).toEqual({ kind: "organization-token" });
        expect(report.guestSession?.live).toBe(false);
        expect(auth.getCurrentUser).not.toHaveBeenCalled();
        const text = formatWhoamiReport(report).join("\n");
        expect(text).toContain("organization token");
        expect(text).toContain("expired");
        expect(text).not.toContain(SESSION.claimUrl);
    });

    it("says when nothing is configured", async () => {
        auth.getToken.mockResolvedValue(undefined);
        const { cliContext } = createTestCliContext();

        const report = await buildWhoamiReport({ cliContext, absolutePathToFernDirectory: fernDirectory });

        expect(report).toEqual({ login: { kind: "none" }, guestSession: undefined });
        expect(formatWhoamiReport(report).join("\n")).toContain("Not logged in");
    });
});
