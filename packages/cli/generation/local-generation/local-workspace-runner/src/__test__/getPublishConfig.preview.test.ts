import { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { getPublishConfig } from "../runLocalGenerationForWorkspace.js";

// Minimal TaskContext stub — every log level is a no-op so a new log call inside
// getPublishConfig fails the assertion rather than a missing-method TypeError.
const mockContext = {
    logger: new Proxy({}, { get: () => () => undefined })
    // Test mock: getPublishConfig only touches the logger.
} as unknown as TaskContext;

function buildGeneratorInvocation(): generatorsYml.GeneratorInvocation {
    // Test mock: only the fields read by getPublishConfig are populated.
    return {
        name: "fernapi/fern-typescript-sdk",
        language: "typescript",
        outputMode: { type: "github" },
        raw: {
            github: { uri: "acme/acme-js", token: "some-token", mode: "pull-request" },
            output: { location: "npm", "package-name": "@acme/sdk" }
        }
    } as unknown as generatorsYml.GeneratorInvocation;
}

describe("getPublishConfig — preview runs do not hand a GitHub token to the generator", () => {
    it("omits the token in preview mode", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation(),
            version: "1.2.3",
            packageName: "@acme/sdk",
            context: mockContext,
            isPreview: true
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github") {
            expect(publishConfig.token).toBeUndefined();
            expect(publishConfig.uri).toBe("acme/acme-js");
        }
    });

    it("forwards the token outside of preview mode", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation(),
            version: "1.2.3",
            packageName: "@acme/sdk",
            context: mockContext
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github") {
            expect(publishConfig.token).toBe("some-token");
        }
    });
});
