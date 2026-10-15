import { CliError } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { CliEnvironment } from "../CliEnvironment.js";
import { getFailedToResolveLatestVersionMessage, getLatestVersionOfCli } from "./getLatestVersionOfCli.js";

const h = vi.hoisted(() => ({
    latestVersion: vi.fn()
}));

vi.mock("latest-version", () => ({ default: h.latestVersion }));
vi.mock("registry-url", () => ({ default: vi.fn(() => "https://npm.example.internal/") }));

const cliEnvironment: CliEnvironment = {
    packageName: "fern-api",
    packageVersion: "1.0.0",
    cliName: "fern"
};

describe("getLatestVersionOfCli", () => {
    it("returns the resolved version", async () => {
        h.latestVersion.mockResolvedValueOnce("1.2.3");
        await expect(getLatestVersionOfCli({ cliEnvironment })).resolves.toBe("1.2.3");
    });

    it("surfaces the registry and the undici cause behind `fetch failed`", async () => {
        const cause = Object.assign(new Error("getaddrinfo ENOTFOUND npm.example.internal"), { code: "ENOTFOUND" });
        h.latestVersion.mockRejectedValueOnce(new TypeError("fetch failed", { cause }));

        const promise = getLatestVersionOfCli({ cliEnvironment });
        await expect(promise).rejects.toBeInstanceOf(CliError);
        await expect(promise).rejects.toMatchObject({
            code: CliError.Code.NetworkError,
            message: expect.stringContaining(
                "Failed to resolve latest CLI version from https://npm.example.internal/fern-api: fetch failed (getaddrinfo ENOTFOUND npm.example.internal)"
            )
        });
    });
});

describe("getFailedToResolveLatestVersionMessage", () => {
    it("prefixes the errno code when the cause message does not already contain it", () => {
        const cause = Object.assign(new Error("self-signed certificate"), { code: "DEPTH_ZERO_SELF_SIGNED_CERT" });
        const message = getFailedToResolveLatestVersionMessage({
            packageName: "fern-api",
            error: new TypeError("fetch failed", { cause })
        });
        expect(message).toContain("fetch failed (DEPTH_ZERO_SELF_SIGNED_CERT: self-signed certificate)");
        expect(message).toContain("NODE_EXTRA_CA_CERTS");
    });

    it("omits the cause when there is none", () => {
        const message = getFailedToResolveLatestVersionMessage({
            packageName: "fern-api",
            error: new Error("Response code 503 (Service Unavailable)")
        });
        expect(message).toContain(
            "Failed to resolve latest CLI version from https://npm.example.internal/fern-api: Response code 503 (Service Unavailable)."
        );
    });
});
