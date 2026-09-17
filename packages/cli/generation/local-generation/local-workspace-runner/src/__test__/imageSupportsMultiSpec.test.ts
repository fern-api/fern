import type { ContainerRunner } from "@fern-api/core-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { imageSupportsMultiSpec, MULTI_SPEC_LABEL } from "../imageSupportsMultiSpec.js";

const { loggingExecaMock } = vi.hoisted(() => ({ loggingExecaMock: vi.fn() }));
vi.mock("@fern-api/logging-execa", () => ({ loggingExeca: loggingExecaMock }));

const IMAGE = "fernenterprise/fern-typescript-sdk:rc";

function inspectReturns({ stdout, exitCode = 0, stderr = "" }: { stdout: string; exitCode?: number; stderr?: string }) {
    loggingExecaMock.mockResolvedValue({ stdout, stderr, exitCode });
}

function supports(imageName: string = IMAGE, runner: ContainerRunner = "docker") {
    return imageSupportsMultiSpec({ imageName, runner, logger: undefined });
}

describe("imageSupportsMultiSpec", () => {
    beforeEach(() => {
        loggingExecaMock.mockReset();
    });

    it("reads the capability from the image's own label", async () => {
        inspectReturns({ stdout: JSON.stringify({ [MULTI_SPEC_LABEL]: "true" }) + "\n" });
        expect(await supports()).toBe(true);
    });

    // The historical case: images published before the label existed resolve only source.specs[0],
    // and some of them do it without reporting a count mismatch.
    it("treats an image without the label as single-spec", async () => {
        inspectReturns({ stdout: JSON.stringify({ "org.opencontainers.image.version": "5.1.0" }) });
        expect(await supports()).toBe(false);
    });

    it("treats an image with no labels at all as single-spec", async () => {
        inspectReturns({ stdout: "null" });
        expect(await supports()).toBe(false);
    });

    it.each(["false", "TRUE", "1", ""])("treats the label value %o as single-spec", async (value) => {
        inspectReturns({ stdout: JSON.stringify({ [MULTI_SPEC_LABEL]: value }) });
        expect(await supports()).toBe(false);
    });

    // Fail closed: the alternative to a refusal is an SDK silently covering one spec that exits zero.
    it("treats a failed inspection as single-spec rather than assuming support", async () => {
        inspectReturns({ stdout: "", stderr: "Cannot connect to the Docker daemon", exitCode: 1 });
        expect(await supports()).toBe(false);
    });

    it("treats output it cannot parse as single-spec", async () => {
        inspectReturns({ stdout: "<no value>" });
        expect(await supports()).toBe(false);
    });

    it("inspects the exact image reference and runner it is given", async () => {
        inspectReturns({ stdout: JSON.stringify({ [MULTI_SPEC_LABEL]: "true" }) });
        const digestPin = "registry.internal.test/postman/fern-python-sdk@sha256:" + "a".repeat(64);

        expect(await supports(digestPin, "podman")).toBe(true);

        expect(loggingExecaMock).toHaveBeenCalledTimes(1);
        expect(loggingExecaMock.mock.calls[0]?.[1]).toBe("podman");
        expect(loggingExecaMock.mock.calls[0]?.[2]).toEqual([
            "inspect",
            "--format",
            "{{json .Config.Labels}}",
            digestPin
        ]);
    });
});
