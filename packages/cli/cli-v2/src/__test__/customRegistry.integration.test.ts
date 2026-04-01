import { loggingExeca } from "@fern-api/logging-execa";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isDockerAvailable, type LocalRegistry, startLocalRegistry } from "./utils/dockerRegistry.js";

const dockerAvailable = await isDockerAvailable();

describe.skipIf(!dockerAvailable)("Custom Registry Integration (v2)", () => {
    let registry: LocalRegistry;

    beforeAll(async () => {
        registry = await startLocalRegistry();
    }, 120_000);

    afterAll(async () => {
        await registry?.cleanup();
    }, 30_000);

    it("pulls image from authenticated local registry", async () => {
        await registry.login();

        await loggingExeca(undefined, "docker", ["rmi", registry.fullImageRef], {
            doNotPipeOutput: true,
            reject: false
        });

        const { exitCode } = await loggingExeca(undefined, "docker", ["pull", registry.fullImageRef], {
            doNotPipeOutput: true,
            reject: false
        });

        expect(exitCode).toBe(0);
    }, 30_000);

    it("fails to pull when not authenticated", async () => {
        await registry.logout();

        await loggingExeca(undefined, "docker", ["rmi", registry.fullImageRef], {
            doNotPipeOutput: true,
            reject: false
        });

        const { exitCode, stderr } = await loggingExeca(undefined, "docker", ["pull", registry.fullImageRef], {
            doNotPipeOutput: true,
            reject: false
        });

        expect(exitCode).not.toBe(0);
        expect(stderr).toMatch(/unauthorized|authentication required|denied/i);

        await registry.login();
    }, 30_000);

    it("constructs correct image reference from Target fields", () => {
        const target = {
            registry: registry.url,
            image: registry.testImage,
            version: registry.testTag
        };
        const imageRef = target.registry ? `${target.registry}/${target.image}` : target.image;
        const containerImage = `${imageRef}:${target.version}`;

        expect(containerImage).toBe(registry.fullImageRef);
    });
});
