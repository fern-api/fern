import { beforeEach, describe, expect, it, vi } from "vitest";

const detectAirGappedMode = vi.hoisted(() => vi.fn());

vi.mock("@fern-api/lazy-fern-workspace", () => ({ detectAirGappedMode }));

import { detectFdrAirGappedMode } from "../runRemoteGenerationForGenerator.js";

describe("detectFdrAirGappedMode", () => {
    beforeEach(() => {
        detectAirGappedMode.mockReset().mockResolvedValue(false);
    });

    it("does not probe FDR when sdk-gen-api uses an SDK Config payload", async () => {
        await expect(
            detectFdrAirGappedMode({
                requiresFdrRegistration: false,
                fdrOrigin: "https://registry.buildwithfern.com",
                logger: {} as never
            })
        ).resolves.toBe(false);

        expect(detectAirGappedMode).not.toHaveBeenCalled();
    });

    it("retains the FDR probe for routes that register API definitions", async () => {
        await detectFdrAirGappedMode({
            requiresFdrRegistration: true,
            fdrOrigin: "https://registry.buildwithfern.com",
            logger: {} as never
        });

        expect(detectAirGappedMode).toHaveBeenCalledWith("https://registry.buildwithfern.com/health", {});
    });
});
