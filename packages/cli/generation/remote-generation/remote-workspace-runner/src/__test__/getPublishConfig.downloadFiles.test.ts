import { generatorsYml } from "@fern-api/configuration";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { getPublishConfig } from "../runRemoteGenerationForGenerator.js";

// Minimal context stub — getPublishConfig only reads `logger.debug`/`logger.warn`.
const mockContext = {
    logger: {
        debug: () => undefined,
        warn: () => undefined
    }
    // Test mock: getPublishConfig only touches the logger.
} as unknown as InteractiveTaskContext;

function buildLocalFileSystemInvocation(fields: {
    name: string;
    language: string;
    config?: unknown;
}): generatorsYml.GeneratorInvocation {
    // Test mock: only the fields read by getPublishConfig are populated.
    return {
        name: fields.name,
        language: fields.language,
        outputMode: {
            type: "downloadFiles",
            _visit: <R>(visitor: { downloadFiles: () => R }) => visitor.downloadFiles()
        },
        raw: {
            output: { location: "local-file-system", path: "../sdk" },
            config: fields.config
        }
    } as unknown as generatorsYml.GeneratorInvocation;
}

describe("getPublishConfig — local-file-system output on the cloud generation path", () => {
    it("threads the npm package identity for typescript when --version is passed", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildLocalFileSystemInvocation({
                name: "fernapi/fern-typescript-node-sdk",
                language: "typescript",
                config: { packageJson: { name: "twilio-core" } }
            }),
            version: "0.0.1",
            userProvidedVersion: "0.0.1",
            packageName: undefined,
            selfHosted: false,
            context: mockContext
        });

        expect(publishConfig?.type).toBe("filesystem");
        if (publishConfig?.type === "filesystem") {
            expect(publishConfig.publishTarget?.type).toBe("npm");
            if (publishConfig.publishTarget?.type === "npm") {
                expect(publishConfig.publishTarget.packageName).toBe("twilio-core");
                expect(publishConfig.publishTarget.version).toBe("0.0.1");
            }
        }
    });

    it("threads the pypi package identity for python", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildLocalFileSystemInvocation({
                name: "fernapi/fern-python-sdk",
                language: "python"
            }),
            version: "1.2.3",
            userProvidedVersion: "1.2.3",
            packageName: "twilio_core",
            selfHosted: false,
            context: mockContext
        });

        expect(publishConfig?.type).toBe("filesystem");
        if (publishConfig?.type === "filesystem") {
            expect(publishConfig.publishTarget?.type).toBe("pypi");
            if (publishConfig.publishTarget?.type === "pypi") {
                expect(publishConfig.publishTarget.packageName).toBe("twilio_core");
                expect(publishConfig.publishTarget.version).toBe("1.2.3");
            }
        }
    });

    it("still returns a filesystem publishing config without a target when no identity is available", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildLocalFileSystemInvocation({
                name: "fernapi/fern-typescript-node-sdk",
                language: "typescript"
            }),
            version: undefined,
            userProvidedVersion: undefined,
            packageName: undefined,
            selfHosted: false,
            context: mockContext
        });

        expect(publishConfig?.type).toBe("filesystem");
        if (publishConfig?.type === "filesystem") {
            expect(publishConfig.publishTarget).toBeUndefined();
        }
    });
});
