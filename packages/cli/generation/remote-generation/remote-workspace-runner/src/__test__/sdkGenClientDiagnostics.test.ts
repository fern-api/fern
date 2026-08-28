import { describe, expect, it } from "vitest";
import { compareSemver, parseExactSemver } from "../sdk-gen-client/exactSemver.js";
import {
    createGeneratorPolicies,
    GeneratorConfigPolicyInvariantError
} from "../sdk-gen-client/generatorConfigPolicy.js";
import {
    GeneratorConfigCompatibilityError,
    type ValidateGeneratorConfigCompatibilityInput,
    validateGeneratorConfigCompatibility
} from "../sdk-gen-client/index.js";

const VALID_INPUT: ValidateGeneratorConfigCompatibilityInput = {
    generatorId: "fernapi/fern-typescript-sdk",
    language: "typescript",
    requestedVersion: "4.0.0",
    configKind: "sdk-config-v1"
};

describe("generator configuration diagnostics", () => {
    it.each([
        "",
        "AUTO",
        "latest",
        "4",
        "4.0",
        "v4.0.0",
        "^4.0.0",
        "~4.0.0",
        ">=4.0.0",
        "4.x",
        "4.0.0 || 5.0.0",
        " 4.0.0",
        "4.0.0 ",
        "04.0.0",
        "4.00.0",
        "4.0.00",
        "4.0.0.0",
        "4.0.0-01"
    ])("rejects non-exact or malformed version %j", (requestedVersion) => {
        const error = captureError(() => validateGeneratorConfigCompatibility({ ...VALID_INPUT, requestedVersion }));

        expect(error).toMatchObject({
            code: "INVALID_GENERATOR_VERSION",
            generatorId: VALID_INPUT.generatorId,
            language: VALID_INPUT.language,
            requestedVersion,
            cutoverVersion: "4.0.0",
            receivedConfigKind: "sdk-config-v1",
            expectedConfigKind: null,
            expectedLanguage: "typescript",
            retryable: false,
            recommendedAction: "USE_EXACT_GENERATOR_VERSION"
        });
    });

    it.each([
        ["missing", undefined],
        ["null", null],
        ["object", { kind: "sdk-config-v1" }],
        ["arbitrary string", "sdk-config-v2"],
        ["number", 1]
    ])("rejects a %s config kind at runtime", (_label, receivedConfigKind) => {
        const malformedInput = {
            ...VALID_INPUT,
            configKind: receivedConfigKind
        } as unknown as ValidateGeneratorConfigCompatibilityInput;
        const error = captureError(() => validateGeneratorConfigCompatibility(malformedInput));

        expect(error).toMatchObject({
            code: "INVALID_CONFIG_KIND",
            generatorId: VALID_INPUT.generatorId,
            language: VALID_INPUT.language,
            requestedVersion: VALID_INPUT.requestedVersion,
            cutoverVersion: "4.0.0",
            receivedConfigKind,
            expectedConfigKind: "sdk-config-v1",
            expectedLanguage: "typescript",
            retryable: false,
            recommendedAction: "USE_SUPPORTED_CONFIG_KIND"
        });
    });

    it("rejects a physically missing config kind property", () => {
        const { configKind: _configKind, ...inputWithoutConfigKind } = VALID_INPUT;
        const error = captureError(() =>
            validateGeneratorConfigCompatibility(inputWithoutConfigKind as ValidateGeneratorConfigCompatibilityInput)
        );

        expect(Object.hasOwn(error, "receivedConfigKind")).toBe(true);
        expect(error).toMatchObject({
            code: "INVALID_CONFIG_KIND",
            receivedConfigKind: undefined,
            retryable: false,
            recommendedAction: "USE_SUPPORTED_CONFIG_KIND"
        });
    });

    it("compares exact prerelease, build, and large numeric versions safely", () => {
        expect(
            validateGeneratorConfigCompatibility({
                ...VALID_INPUT,
                requestedVersion: "4.0.0-rc.1",
                configKind: "legacy-fern"
            }).payloadKind
        ).toBe("fern-runtime-bundle");

        expect(
            validateGeneratorConfigCompatibility({
                ...VALID_INPUT,
                requestedVersion: "4.0.0+build.123"
            }).payloadKind
        ).toBe("sdk-config-ir-v1");

        expect(
            validateGeneratorConfigCompatibility({
                ...VALID_INPUT,
                requestedVersion: "900719925474099300000.0.0"
            }).payloadKind
        ).toBe("sdk-config-ir-v1");
    });

    it("follows SemVer prerelease precedence", () => {
        const versions = [
            "1.0.0-alpha",
            "1.0.0-alpha.1",
            "1.0.0-alpha.beta",
            "1.0.0-beta",
            "1.0.0-beta.2",
            "1.0.0-beta.11",
            "1.0.0-rc.1",
            "1.0.0"
        ];

        for (let index = 1; index < versions.length; index += 1) {
            expect(compareSemver(parse(versions[index - 1] ?? ""), parse(versions[index] ?? ""))).toBeLessThan(0);
        }
    });

    it.each([
        "1.0.0-",
        "1.0.0+",
        "1.0.0-alpha..1",
        "1.0.0+build..1",
        "1.0.0-alpha_1"
    ])("rejects malformed prerelease or build version %s", (version) => {
        expect(parseExactSemver(version)).toBeNull();
    });

    it("returns stable diagnostics for an unknown generator", () => {
        const error = captureError(() =>
            validateGeneratorConfigCompatibility({
                ...VALID_INPUT,
                generatorId: "acme/custom-generator"
            })
        );

        expect(error).toMatchObject({
            name: "GeneratorConfigCompatibilityError",
            code: "UNKNOWN_GENERATOR",
            generatorId: "acme/custom-generator",
            language: "typescript",
            requestedVersion: "4.0.0",
            cutoverVersion: null,
            receivedConfigKind: "sdk-config-v1",
            expectedConfigKind: null,
            expectedLanguage: null,
            retryable: false,
            recommendedAction: "USE_KNOWN_GENERATOR_ID"
        });
    });

    it("returns stable diagnostics for a language mismatch", () => {
        const error = captureError(() =>
            validateGeneratorConfigCompatibility({
                ...VALID_INPUT,
                generatorId: "fernapi/fern-typescript-node-sdk",
                language: "python"
            })
        );

        expect(error).toMatchObject({
            code: "GENERATOR_LANGUAGE_MISMATCH",
            generatorId: "fernapi/fern-typescript-node-sdk",
            language: "python",
            requestedVersion: "4.0.0",
            cutoverVersion: "4.0.0",
            receivedConfigKind: "sdk-config-v1",
            expectedConfigKind: null,
            expectedLanguage: "typescript",
            retryable: false,
            recommendedAction: "USE_GENERATOR_LANGUAGE"
        });
    });

    it("fails malformed internal cutovers with a typed invariant diagnostic", () => {
        const error = capturePolicyError(() =>
            createGeneratorPolicies([["fernapi/invalid-sdk", { language: "typescript", cutoverVersion: "AUTO" }]])
        );

        expect(error).toMatchObject({
            name: "GeneratorConfigPolicyInvariantError",
            code: "INVALID_GENERATOR_CUTOVER_POLICY",
            generatorId: "fernapi/invalid-sdk",
            language: "typescript",
            cutoverVersion: "AUTO",
            retryable: false,
            recommendedAction: "FIX_GENERATOR_CUTOVER_POLICY"
        });
    });
});

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

function parse(version: string) {
    const parsed = parseExactSemver(version);
    if (parsed == null) {
        throw new Error(`Expected an exact semantic version: ${version}`);
    }
    return parsed;
}

function capturePolicyError(action: () => unknown): GeneratorConfigPolicyInvariantError {
    try {
        action();
    } catch (error: unknown) {
        if (error instanceof GeneratorConfigPolicyInvariantError) {
            return error;
        }
        throw error;
    }
    throw new Error("Expected policy validation to throw");
}
