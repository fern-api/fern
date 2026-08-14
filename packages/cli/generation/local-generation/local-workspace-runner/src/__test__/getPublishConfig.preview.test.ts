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

function buildGeneratorInvocation(token: string | undefined): generatorsYml.GeneratorInvocation {
    // Test mock: only the fields read by getPublishConfig are populated.
    return {
        name: "fernapi/fern-typescript-sdk",
        language: "typescript",
        outputMode: { type: "github" },
        raw: {
            github: { uri: "acme/acme-js", token, mode: "pull-request" },
            output: { location: "npm", "package-name": "@acme/sdk" }
        }
    } as unknown as generatorsYml.GeneratorInvocation;
}

describe("getPublishConfig — preview runs do not hand a GitHub token to the generator", () => {
    it("omits an empty token in preview mode", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation(""),
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

    it("omits an absent token in preview mode", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation(undefined),
            version: "1.2.3",
            packageName: "@acme/sdk",
            context: mockContext,
            isPreview: true
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github") {
            expect(publishConfig.token).toBeUndefined();
        }
    });

    it("forwards a usable token in preview mode", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation("some-token"),
            version: "1.2.3",
            packageName: "@acme/sdk",
            context: mockContext,
            isPreview: true
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github") {
            expect(publishConfig.token).toBe("some-token");
        }
    });

    it("forwards an empty token outside of preview mode", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation(""),
            version: "1.2.3",
            packageName: "@acme/sdk",
            context: mockContext
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github") {
            expect(publishConfig.token).toBe("");
        }
    });

    it("forwards the token outside of preview mode", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation("some-token"),
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
