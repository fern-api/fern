import { describe, expect, it, vi } from "vitest";

import { isPublicIpAddress, safeFetchRemoteText, validateRemoteUrl } from "../utils/safeRemoteUrl.js";

describe("safe remote URL resolution", () => {
    it.each([
        "0.0.0.0",
        "10.0.0.1",
        "100.64.0.1",
        "127.0.0.1",
        "169.254.169.254",
        "172.16.0.1",
        "192.168.0.1",
        "::",
        "::1",
        "::ffff:127.0.0.1",
        "::ffff:0:127.0.0.1",
        "64:ff9b::127.0.0.1",
        "64:ff9b:1::808:808",
        "2002:7f00:1::",
        "fc00::1",
        "fe80::1"
    ])("blocks non-public address %s", (address) => {
        expect(isPublicIpAddress(address)).toBe(false);
    });

    it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("allows public address %s", (address) => {
        expect(isPublicIpAddress(address)).toBe(true);
    });

    it("blocks hosts that resolve to cloud metadata or private addresses", async () => {
        await expect(
            validateRemoteUrl(
                "https://metadata.example.com/openapi.yml",
                vi.fn().mockResolvedValue([{ address: "169.254.169.254", family: 4 }]) as never
            )
        ).rejects.toThrow("blocked address");
    });

    it("blocks a host when any DNS answer is non-public", async () => {
        await expect(
            validateRemoteUrl(
                "https://mixed.example.com/openapi.yml",
                vi.fn().mockResolvedValue([
                    { address: "8.8.8.8", family: 4 },
                    { address: "10.0.0.1", family: 4 }
                ]) as never
            )
        ).rejects.toThrow("10.0.0.1");
    });

    it("blocks URL credentials before DNS resolution", async () => {
        const lookup = vi.fn();
        await expect(
            validateRemoteUrl("https://user:password@example.com/openapi.yml", lookup as never)
        ).rejects.toThrow("cannot contain credentials");
        expect(lookup).not.toHaveBeenCalled();
    });

    it("revalidates redirect destinations before requesting them", async () => {
        const lookup = vi.fn(async (hostname: string) => [
            { address: hostname === "public.example.com" ? "8.8.8.8" : "127.0.0.1", family: 4 }
        ]);
        const request = vi.fn().mockResolvedValue({
            statusCode: 302,
            headers: { location: "http://internal.example.com/openapi.yml" },
            body: Buffer.alloc(0)
        });

        await expect(
            safeFetchRemoteText("https://public.example.com/openapi.yml", {
                lookup: lookup as never,
                request
            })
        ).rejects.toThrow("blocked address");
        expect(request).toHaveBeenCalledTimes(1);
    });
});
