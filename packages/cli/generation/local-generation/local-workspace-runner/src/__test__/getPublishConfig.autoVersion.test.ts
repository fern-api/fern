import { generatorsYml } from "@fern-api/configuration";
import { MAGIC_VERSION, MAGIC_VERSION_PYTHON } from "@fern-api/generator-cli/autoversion";
import { TaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { getPublishConfig } from "../runLocalGenerationForWorkspace.js";

// Minimal TaskContext stub — getPublishConfig only reads `logger.debug`/`logger.warn`.
const mockContext = {
    logger: {
        debug: () => undefined,
        warn: () => undefined
    }
    // Test mock: getPublishConfig only touches the logger.
} as unknown as TaskContext;

function buildGeneratorInvocation(fields: {
    name: string;
    language: string;
    github: { uri: string; token: string; mode: string };
    output: { location: string; "package-name": string };
}): generatorsYml.GeneratorInvocation {
    // Test mock: only the fields read by getPublishConfig are populated.
    return {
        name: fields.name,
        language: fields.language,
        outputMode: { type: "github" },
        raw: {
            github: fields.github,
            output: fields.output
        }
    } as unknown as generatorsYml.GeneratorInvocation;
}

describe("getPublishConfig — --version AUTO does not leak the literal 'AUTO' string", () => {
    it("substitutes the magic placeholder into the self-hosted GitHub npm publish target", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation({
                name: "fernapi/fern-typescript-sdk",
                language: "typescript",
                github: { uri: "acme/acme-js", token: "${GITHUB_TOKEN}", mode: "pull-request" },
                output: { location: "npm", "package-name": "@acme/sdk" }
            }),
            version: "AUTO",
            userProvidedVersion: "AUTO",
            packageName: "@acme/sdk",
            context: mockContext
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github") {
            expect(publishConfig.target?.type).toBe("npm");
            if (publishConfig.target?.type === "npm") {
                expect(publishConfig.target.version).toBe(MAGIC_VERSION);
                expect(publishConfig.target.version).not.toBe("AUTO");
            }
        }
    });

    it("uses the Python-flavored magic placeholder for a self-hosted pypi target", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation({
                name: "fernapi/fern-python-sdk",
                language: "python",
                github: { uri: "acme/acme-py", token: "${GITHUB_TOKEN}", mode: "pull-request" },
                output: { location: "pypi", "package-name": "acme-sdk" }
            }),
            version: "AUTO",
            userProvidedVersion: "AUTO",
            packageName: "acme-sdk",
            context: mockContext
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github") {
            expect(publishConfig.target?.type).toBe("pypi");
            if (publishConfig.target?.type === "pypi") {
                expect(publishConfig.target.version).toBe(MAGIC_VERSION_PYTHON);
                expect(publishConfig.target.version).not.toBe("AUTO");
            }
        }
    });

    it("preserves an explicit version unchanged", () => {
        const publishConfig = getPublishConfig({
            generatorInvocation: buildGeneratorInvocation({
                name: "fernapi/fern-typescript-sdk",
                language: "typescript",
                github: { uri: "acme/acme-js", token: "${GITHUB_TOKEN}", mode: "pull-request" },
                output: { location: "npm", "package-name": "@acme/sdk" }
            }),
            version: "1.2.3",
            userProvidedVersion: "1.2.3",
            packageName: "@acme/sdk",
            context: mockContext
        });

        expect(publishConfig?.type).toBe("github");
        if (publishConfig?.type === "github" && publishConfig.target?.type === "npm") {
            expect(publishConfig.target.version).toBe("1.2.3");
        }
    });
});
