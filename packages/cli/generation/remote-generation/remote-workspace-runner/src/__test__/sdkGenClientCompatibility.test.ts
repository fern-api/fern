// cspell:ignore kotlin
import { describe, expect, it } from "vitest";
import {
    type GenerationConfigKind,
    type GenerationConfigRoute,
    GeneratorConfigCompatibilityError,
    type GeneratorLanguage,
    getGeneratorLanguage,
    validateGeneratorConfigCompatibility
} from "../sdk-gen-client/index.js";

interface LanguageBoundary {
    generatorId: string;
    language: GeneratorLanguage;
    below: string;
    cutover: string;
    above: string;
}

const LANGUAGE_BOUNDARIES: readonly LanguageBoundary[] = [
    {
        generatorId: "fernapi/fern-typescript-sdk",
        language: "typescript",
        below: "3.999.999",
        cutover: "4.0.0",
        above: "4.0.1"
    },
    {
        generatorId: "fernapi/fern-python-sdk",
        language: "python",
        below: "5.999.999",
        cutover: "6.0.0",
        above: "6.0.1"
    },
    {
        generatorId: "fernapi/fern-java-sdk",
        language: "java",
        below: "4.999.999",
        cutover: "5.0.0",
        above: "5.0.1"
    },
    {
        generatorId: "fernapi/fern-kotlin-sdk",
        language: "kotlin",
        below: "4.999.999",
        cutover: "5.0.0",
        above: "5.0.1"
    },
    {
        generatorId: "fernapi/fern-go-sdk",
        language: "go",
        below: "1.999.999",
        cutover: "2.0.0",
        above: "2.0.1"
    },
    {
        generatorId: "fernapi/fern-csharp-sdk",
        language: "csharp",
        below: "2.999.999",
        cutover: "3.0.0",
        above: "3.0.1"
    },
    {
        generatorId: "fernapi/fern-php-sdk",
        language: "php",
        below: "2.999.999",
        cutover: "3.0.0",
        above: "3.0.1"
    },
    {
        generatorId: "fernapi/fern-ruby-sdk",
        language: "ruby",
        below: "1.999.999",
        cutover: "2.0.0",
        above: "2.0.1"
    },
    {
        generatorId: "fernapi/fern-rust-sdk",
        language: "rust",
        below: "0.999.999",
        cutover: "1.0.0",
        above: "1.0.1"
    },
    {
        generatorId: "fernapi/fern-swift-sdk",
        language: "swift",
        below: "0.999.999",
        cutover: "1.0.0",
        above: "1.0.1"
    },
    {
        generatorId: "fernapi/fern-cli",
        language: "cli",
        below: "0.999.999",
        cutover: "1.0.0",
        above: "1.0.1"
    },
    {
        generatorId: "fernapi/fern-mcp-server",
        language: "mcp",
        below: "0.0.999",
        cutover: "0.1.0",
        above: "0.1.1"
    }
];

const GENERATOR_ALIASES: ReadonlyArray<readonly [string, GeneratorLanguage, string]> = [
    ["fernapi/fern-typescript", "typescript", "4.0.0"],
    ["fernapi/fern-typescript-sdk", "typescript", "4.0.0"],
    ["fernapi/fern-typescript-node-sdk", "typescript", "4.0.0"],
    ["fernapi/fern-typescript-browser-sdk", "typescript", "4.0.0"],
    ["fernapi/fern-python-sdk", "python", "6.0.0"],
    ["fernapi/fern-java-sdk", "java", "5.0.0"],
    ["fernapi/fern-kotlin-sdk", "kotlin", "5.0.0"],
    ["fernapi/fern-go-sdk", "go", "2.0.0"],
    ["fernapi/fern-csharp-sdk", "csharp", "3.0.0"],
    ["fernapi/fern-php-sdk", "php", "3.0.0"],
    ["fernapi/fern-ruby-sdk", "ruby", "2.0.0"],
    ["fernapi/fern-ruby-sdk-v2", "ruby", "2.0.0"],
    ["fernapi/fern-rust-sdk", "rust", "1.0.0"],
    ["fernapi/fern-swift-sdk", "swift", "1.0.0"],
    ["fernapi/fern-cli", "cli", "1.0.0"],
    ["fernapi/fern-cli-generator", "cli", "1.0.0"],
    ["fernapi/fern-mcp-server", "mcp", "0.1.0"]
];

describe("validateGeneratorConfigCompatibility", () => {
    describe.each(LANGUAGE_BOUNDARIES)("$language cutover", (boundary) => {
        it("routes cutover-1 to the Fern runtime bundle", () => {
            expect(validate(boundary, boundary.below, "legacy-fern")).toEqual({
                generatorId: boundary.generatorId,
                language: boundary.language,
                requestedVersion: boundary.below,
                cutoverVersion: boundary.cutover,
                configKind: "legacy-fern",
                payloadKind: "fern-runtime-bundle"
            });
        });

        it("rejects SDK Config at cutover-1", () => {
            const error = captureError(() => validate(boundary, boundary.below, "sdk-config-v1"));
            expect(error).toMatchObject({
                code: "LEGACY_FERN_CONFIG_REQUIRED",
                generatorId: boundary.generatorId,
                language: boundary.language,
                requestedVersion: boundary.below,
                cutoverVersion: boundary.cutover,
                receivedConfigKind: "sdk-config-v1",
                expectedConfigKind: "legacy-fern",
                expectedLanguage: boundary.language,
                retryable: false,
                recommendedAction: "USE_LEGACY_FERN_CONFIG"
            });
        });

        it("routes cutover to SDK Config v1", () => {
            expect(validate(boundary, boundary.cutover, "sdk-config-v1").payloadKind).toBe("sdk-config-v1");
        });

        it("rejects legacy Fern configuration at cutover", () => {
            const error = captureError(() => validate(boundary, boundary.cutover, "legacy-fern"));
            expect(error).toMatchObject({
                code: "SDK_CONFIG_V1_REQUIRED",
                generatorId: boundary.generatorId,
                language: boundary.language,
                requestedVersion: boundary.cutover,
                cutoverVersion: boundary.cutover,
                receivedConfigKind: "legacy-fern",
                expectedConfigKind: "sdk-config-v1",
                expectedLanguage: boundary.language,
                retryable: false,
                recommendedAction: "USE_SDK_CONFIG_V1"
            });
        });

        it("routes cutover+1 to SDK Config v1", () => {
            expect(validate(boundary, boundary.above, "sdk-config-v1").payloadKind).toBe("sdk-config-v1");
        });
    });

    it.each(GENERATOR_ALIASES)("maps alias %s to %s", (generatorId, language, cutoverVersion) => {
        expect(getGeneratorLanguage(generatorId)).toBe(language);
        expect(
            validateGeneratorConfigCompatibility({
                generatorId,
                language,
                requestedVersion: cutoverVersion,
                configKind: "sdk-config-v1"
            })
        ).toMatchObject({ language, cutoverVersion, payloadKind: "sdk-config-v1" });
    });

    it("does not expose a language for an unknown generator", () => {
        expect(getGeneratorLanguage("acme/custom-generator")).toBeUndefined();
    });
});

function validate(
    boundary: LanguageBoundary,
    requestedVersion: string,
    configKind: GenerationConfigKind
): GenerationConfigRoute {
    return validateGeneratorConfigCompatibility({
        generatorId: boundary.generatorId,
        language: boundary.language,
        requestedVersion,
        configKind
    });
}

function captureError(action: () => unknown): GeneratorConfigCompatibilityError {
    try {
        action();
    } catch (error: unknown) {
        if (error instanceof GeneratorConfigCompatibilityError) {
            return error;
        }
        throw error;
    }
    throw new Error("Expected compatibility validation to throw");
}
