import { CONSOLE_LOGGER } from "@fern-api/logger";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { explainCaBundleMountFailure, verifyCaBundleMount } from "../verifyCaBundleMount.js";

const { loggingExecaMock } = vi.hoisted(() => ({ loggingExecaMock: vi.fn() }));
vi.mock("@fern-api/logging-execa", () => ({ loggingExeca: loggingExecaMock }));

const BUNDLE_CONTENTS = "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n";

describe("verifyCaBundleMount", () => {
    let dir: string;
    let bundle: string;
    let index = 0;

    beforeAll(() => {
        dir = mkdtempSync(path.join(tmpdir(), "fern-verify-ca-"));
    });

    afterAll(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    beforeEach(() => {
        loggingExecaMock.mockReset();
        // A distinct path per test keeps the success cache from leaking between cases.
        bundle = path.join(dir, `bundle-${index++}.pem`);
        writeFileSync(bundle, BUNDLE_CONTENTS);
    });

    async function verify(): Promise<void> {
        await verifyCaBundleMount({
            hostPath: bundle,
            imageName: "fernapi/fern-typescript-sdk:1.0.0",
            runner: "docker",
            logger: CONSOLE_LOGGER
        });
    }

    it("passes when the container reports the same byte count", async () => {
        loggingExecaMock.mockResolvedValue({
            stdout: `${Buffer.byteLength(BUNDLE_CONTENTS)}\n`,
            stderr: "",
            exitCode: 0
        });
        await expect(verify()).resolves.toBeUndefined();

        const args = loggingExecaMock.mock.calls[0]?.[2] as string[];
        expect(args).toContain("-v");
        expect(args).toContain(`${bundle}:/probe:ro`);
        expect(args[args.length - 1]).toContain("test -f /probe");
    });

    it("caches success so a generator group probes an image once", async () => {
        loggingExecaMock.mockResolvedValue({
            stdout: `${Buffer.byteLength(BUNDLE_CONTENTS)}\n`,
            stderr: "",
            exitCode: 0
        });
        await verify();
        await verify();
        expect(loggingExecaMock).toHaveBeenCalledTimes(1);
    });

    it("throws when the runtime fabricates an empty directory (Colima, DinD)", async () => {
        // `test -f /probe` fails with no stderr: the source did not exist on the daemon's
        // filesystem, so `-v` created a directory there instead of failing.
        loggingExecaMock.mockResolvedValue({ stdout: "", stderr: "", exitCode: 1 });
        await expect(verify()).rejects.toThrow(/could not be mounted into the generator container/);
    });

    it("throws when the runtime refuses the bind outright", async () => {
        loggingExecaMock.mockResolvedValue({
            stdout: "",
            stderr: "Error response from daemon: mounts denied: \nThe path /opt/homebrew/x is not shared",
            exitCode: 125
        });
        await expect(verify()).rejects.toThrow(/mounts denied/);
    });

    it("throws when the container sees a different file", async () => {
        loggingExecaMock.mockResolvedValue({ stdout: "0\n", stderr: "", exitCode: 0 });
        await expect(verify()).rejects.toThrow(/the container saw 0 bytes/);
    });

    it("warns and continues when the probe itself cannot run", async () => {
        // 125-127 are the runtime's own failures, not the container's. Observed for real
        // against an image with no passwd entry for root.
        loggingExecaMock.mockResolvedValue({
            stdout: "",
            stderr: "docker: Error response from daemon: unable to find user root: no matching entries in passwd file",
            exitCode: 125
        });
        await expect(verify()).resolves.toBeUndefined();
    });

    it("still throws on an empty mount when stderr carries pull noise", async () => {
        // Docker prints "Unable to find image ... locally" to stderr while pulling, so the
        // classification cannot rely on stderr being empty; exit 1 means our shell ran.
        loggingExecaMock.mockResolvedValue({
            stdout: "",
            stderr: 'Unable to find image "fernapi/fern-typescript-sdk:1.0.0" locally\n1.0.0: Pulling from fernapi',
            exitCode: 1
        });
        await expect(verify()).rejects.toThrow(/could not be mounted into the generator container/);
    });

    it("warns rather than blaming the mount when the runtime is unreachable", async () => {
        // The CLI exits 1 for a connection failure, the same code the container's command
        // uses, so this has to be separated by message. Observed against an unreachable
        // DOCKER_HOST during e2e, where it was misreported as an invisible bundle.
        loggingExecaMock.mockResolvedValue({
            stdout: "",
            stderr: "Cannot connect to the Docker daemon at tcp://127.0.0.1:2375. Is the docker daemon running?",
            exitCode: 1
        });
        await expect(verify()).resolves.toBeUndefined();
    });

    it("does not block generation when the runner binary is missing", async () => {
        loggingExecaMock.mockResolvedValue({ stdout: "", stderr: "", exitCode: null });
        await expect(verify()).resolves.toBeUndefined();
    });
});

describe("explainCaBundleMountFailure", () => {
    const base = {
        hostPath: "/opt/homebrew/etc/ca-certificates/cert.pem",
        imageName: "fernapi/fern-typescript-sdk:1.0.0",
        runner: "docker" as const,
        detail: "nothing was visible at /probe inside the container"
    };

    it("explains a remote daemon before considering the platform", () => {
        const message = explainCaBundleMountFailure({
            ...base,
            platform: "linux",
            dockerHost: "tcp://localhost:2375"
        });
        expect(message).toContain("DOCKER_HOST is set to tcp://localhost:2375");
        expect(message).toContain("$RUNNER_TEMP");
        expect(message).not.toContain("SELinux");
    });

    it("explains VM file sharing on macOS, naming every supported runtime", () => {
        const message = explainCaBundleMountFailure({ ...base, platform: "darwin", dockerHost: undefined });
        expect(message).toContain("Docker Desktop");
        expect(message).toContain("Colima");
        expect(message).toContain("podman machine");
        expect(message).toContain("symlink");
    });

    it("explains shared drives on Windows", () => {
        const message = explainCaBundleMountFailure({ ...base, platform: "win32", dockerHost: undefined });
        expect(message).toContain("WSL2");
        expect(message).not.toContain("Colima");
    });

    it("explains permissions, SELinux and remote contexts on Linux", () => {
        const message = explainCaBundleMountFailure({ ...base, platform: "linux", dockerHost: undefined });
        expect(message).toContain("SELinux");
        expect(message).toContain("rootless");
        // Relabeling a system trust store breaks host tooling, so never suggest it.
        expect(message).toContain("Do not add :z or :Z");
        expect(message).not.toContain("File Sharing");
    });

    it("names the configured runner rather than hardcoding docker", () => {
        const message = explainCaBundleMountFailure({
            ...base,
            runner: "podman",
            platform: "linux",
            dockerHost: undefined
        });
        expect(message).toContain("rootless podman");
        expect(message).toContain("podman context ls");
        expect(message).toContain("podman run --rm");
    });

    it("always ends with a reproducer", () => {
        for (const platform of ["darwin", "linux", "win32"] as NodeJS.Platform[]) {
            expect(explainCaBundleMountFailure({ ...base, platform, dockerHost: undefined })).toContain(
                "Reproduce directly:"
            );
        }
    });
});
