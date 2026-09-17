import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn()
}));

import { loggingExeca } from "@fern-api/logging-execa";

import { ensureDockerHubOatLogin, getDockerHubNamespace, resolveDockerHubOatLogin } from "../dockerHubOatLogin.js";

const OAT = "dckr_oat_example";

describe("getDockerHubNamespace", () => {
    it("reads the namespace from a bare Docker Hub reference", () => {
        expect(getDockerHubNamespace("fernenterprise/fern-python-sdk:rc")).toBe("fernenterprise");
    });

    it("reads the namespace from an explicit Docker Hub host", () => {
        expect(getDockerHubNamespace("docker.io/fernenterprise/fern-python-sdk:6.0.0")).toBe("fernenterprise");
        expect(getDockerHubNamespace("index.docker.io/fernenterprise/fern-python-sdk")).toBe("fernenterprise");
    });

    it("reads the namespace from a host in any case, which Docker accepts", () => {
        expect(getDockerHubNamespace("DOCKER.IO/fernenterprise/fern-python-sdk:rc")).toBe("fernenterprise");
    });

    it("is undefined for an official library image", () => {
        expect(getDockerHubNamespace("alpine:3")).toBeUndefined();
    });

    it("is undefined for another registry", () => {
        expect(getDockerHubNamespace("ghcr.io/fernenterprise/fern-python-sdk:rc")).toBeUndefined();
        expect(getDockerHubNamespace("localhost:5000/fernenterprise/fern-python-sdk")).toBeUndefined();
    });
});

describe("resolveDockerHubOatLogin", () => {
    it("logs in for an image in the organization's namespace", () => {
        expect(resolveDockerHubOatLogin("fernenterprise/fern-python-sdk:rc", { DOCKERHUB_OAT: OAT })).toEqual({
            username: "fernenterprise",
            token: OAT
        });
    });

    it("does nothing when no token is set", () => {
        expect(resolveDockerHubOatLogin("fernenterprise/fern-python-sdk:rc", {})).toBeUndefined();
        expect(resolveDockerHubOatLogin("fernenterprise/fern-python-sdk:rc", { DOCKERHUB_OAT: "  " })).toBeUndefined();
    });

    it("does not send the token to another namespace or registry", () => {
        expect(resolveDockerHubOatLogin("fernapi/fern-python-sdk:6.0.0", { DOCKERHUB_OAT: OAT })).toBeUndefined();
        expect(
            resolveDockerHubOatLogin("ghcr.io/fernenterprise/fern-python-sdk:rc", { DOCKERHUB_OAT: OAT })
        ).toBeUndefined();
    });

    it("honors a namespace override", () => {
        const env = { DOCKERHUB_OAT: OAT, DOCKERHUB_OAT_USERNAME: "acme-staging" };
        expect(resolveDockerHubOatLogin("acme-staging/fern-python-sdk:rc", env)).toEqual({
            username: "acme-staging",
            token: OAT
        });
        expect(resolveDockerHubOatLogin("fernenterprise/fern-python-sdk:rc", env)).toBeUndefined();
    });
});

describe("ensureDockerHubOatLogin", () => {
    beforeEach(() => {
        (loggingExeca as Mock).mockReset();
        (loggingExeca as Mock).mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });
    });

    it("passes the token on stdin rather than as an argument", async () => {
        await ensureDockerHubOatLogin({
            imageName: "fernenterprise/fern-python-sdk:rc",
            env: { DOCKERHUB_OAT: OAT }
        });

        const [, executable, args, options] = (loggingExeca as Mock).mock.calls[0] ?? [];
        expect(executable).toBe("docker");
        expect(args).toEqual(["login", "--username", "fernenterprise", "--password-stdin"]);
        expect(args).not.toContain(OAT);
        expect(options.input).toBe(OAT);
        expect(options.secrets).toContain(OAT);
    });

    it("forwards the caller's abort signal so a stalled login is cancellable", async () => {
        const controller = new AbortController();
        await ensureDockerHubOatLogin({
            imageName: "fernenterprise/fern-python-sdk:rc",
            signal: controller.signal,
            env: { DOCKERHUB_OAT: OAT }
        });

        expect((loggingExeca as Mock).mock.calls[0]?.[3].signal).toBe(controller.signal);
    });

    it("uses the configured container runner", async () => {
        await ensureDockerHubOatLogin({
            imageName: "fernenterprise/fern-python-sdk:rc",
            runner: "podman",
            env: { DOCKERHUB_OAT: OAT }
        });

        expect((loggingExeca as Mock).mock.calls[0]?.[1]).toBe("podman");
    });

    it("does not run a login when the image needs no token", async () => {
        await ensureDockerHubOatLogin({
            imageName: "fernapi/fern-python-sdk:6.0.0",
            env: { DOCKERHUB_OAT: OAT }
        });

        expect((loggingExeca as Mock).mock.calls).toHaveLength(0);
    });

    it("fails with a message naming the token when the login is rejected", async () => {
        (loggingExeca as Mock).mockResolvedValue({ stdout: "", stderr: "unauthorized", exitCode: 1 });

        await expect(
            ensureDockerHubOatLogin({
                imageName: "fernenterprise/fern-python-sdk:rc",
                env: { DOCKERHUB_OAT: OAT }
            })
        ).rejects.toThrow(/DOCKERHUB_OAT/);
    });

    it("reports a cancelled login as cancelled rather than blaming the token", async () => {
        (loggingExeca as Mock).mockResolvedValue({ stdout: "", stderr: "", exitCode: 1 });
        const controller = new AbortController();
        controller.abort();

        await expect(
            ensureDockerHubOatLogin({
                imageName: "fernenterprise/fern-python-sdk:rc",
                signal: controller.signal,
                env: { DOCKERHUB_OAT: OAT }
            })
        ).rejects.toThrow(/was cancelled/);
    });

    it("retries a failed login rather than caching the failure", async () => {
        (loggingExeca as Mock).mockResolvedValueOnce({ stdout: "", stderr: "unauthorized", exitCode: 1 });
        const args = { imageName: "fernenterprise/fern-python-sdk:rc", env: { DOCKERHUB_OAT: OAT } };

        await expect(ensureDockerHubOatLogin(args)).rejects.toThrow();
        await expect(ensureDockerHubOatLogin(args)).resolves.toBeUndefined();
        expect((loggingExeca as Mock).mock.calls).toHaveLength(2);
    });
});
