// cspell:ignore kotlin
import { compareSemver, parseExactSemver } from "./exactSemver.js";
import { type GeneratorPolicy, getGeneratorPolicy } from "./generatorConfigPolicy.js";

export type GeneratorLanguage =
    | "typescript"
    | "python"
    | "java"
    | "kotlin"
    | "go"
    | "csharp"
    | "php"
    | "ruby"
    | "rust"
    | "swift"
    | "cli"
    | "mcp";

export type GenerationConfigKind = "legacy-fern" | "sdk-config-v1";

export type GenerationPayloadKind = "fern-runtime-bundle" | "sdk-config-v1";

/** Inputs used to select the configuration payload route for a generator invocation. */
export interface ValidateGeneratorConfigCompatibilityInput {
    generatorId: string;
    language: GeneratorLanguage;
    requestedVersion: string;
    configKind: GenerationConfigKind;
}

export type SelectGeneratorConfigRouteInput = Omit<ValidateGeneratorConfigCompatibilityInput, "configKind">;

/** Validated route and payload kind that the caller should submit for generation. */
export interface GenerationConfigRoute {
    generatorId: string;
    language: GeneratorLanguage;
    requestedVersion: string;
    cutoverVersion: string;
    configKind: GenerationConfigKind;
    payloadKind: GenerationPayloadKind;
}

export type GeneratorConfigCompatibilityErrorCode =
    | "UNKNOWN_GENERATOR"
    | "GENERATOR_LANGUAGE_MISMATCH"
    | "INVALID_GENERATOR_VERSION"
    | "INVALID_CONFIG_KIND"
    | "LEGACY_FERN_CONFIG_REQUIRED"
    | "SDK_CONFIG_V1_REQUIRED";

export type GeneratorConfigCompatibilityRecommendedAction =
    | "USE_KNOWN_GENERATOR_ID"
    | "USE_GENERATOR_LANGUAGE"
    | "USE_EXACT_GENERATOR_VERSION"
    | "USE_SUPPORTED_CONFIG_KIND"
    | "USE_LEGACY_FERN_CONFIG"
    | "USE_SDK_CONFIG_V1";

interface GeneratorConfigCompatibilityErrorInput {
    code: GeneratorConfigCompatibilityErrorCode;
    message: string;
    generatorId: string;
    language: GeneratorLanguage;
    requestedVersion: string;
    cutoverVersion: string | null;
    receivedConfigKind: unknown;
    expectedLanguage: GeneratorLanguage | null;
    expectedConfigKind: GenerationConfigKind | null;
    recommendedAction: GeneratorConfigCompatibilityRecommendedAction;
}

/** Stable diagnostic that the CLI can translate at its product boundary. */
export class GeneratorConfigCompatibilityError extends Error {
    public override readonly name = "GeneratorConfigCompatibilityError";
    public readonly code: GeneratorConfigCompatibilityErrorCode;
    public readonly generatorId: string;
    public readonly language: GeneratorLanguage;
    public readonly requestedVersion: string;
    public readonly cutoverVersion: string | null;
    public readonly receivedConfigKind: unknown;
    public readonly expectedConfigKind: GenerationConfigKind | null;
    public readonly expectedLanguage: GeneratorLanguage | null;
    public readonly retryable = false;
    public readonly recommendedAction: GeneratorConfigCompatibilityRecommendedAction;

    public constructor(input: GeneratorConfigCompatibilityErrorInput) {
        super(input.message);
        this.code = input.code;
        this.generatorId = input.generatorId;
        this.language = input.language;
        this.requestedVersion = input.requestedVersion;
        this.cutoverVersion = input.cutoverVersion;
        this.receivedConfigKind = input.receivedConfigKind;
        this.expectedConfigKind = input.expectedConfigKind;
        this.expectedLanguage = input.expectedLanguage;
        this.recommendedAction = input.recommendedAction;
    }
}

/** Returns a known generator's language without exposing its cutover policy. */
export function getGeneratorLanguage(generatorId: string): GeneratorLanguage | undefined {
    return getGeneratorPolicy(generatorId)?.language;
}

/** Validates identity, language, exact version, and config kind, then selects the payload route. */
export function validateGeneratorConfigCompatibility(
    input: ValidateGeneratorConfigCompatibilityInput
): GenerationConfigRoute {
    const route = selectGeneratorConfigRoute(input);
    const receivedConfigKind: unknown = input.configKind;
    if (!isGenerationConfigKind(receivedConfigKind)) {
        throw compatibilityError(
            input,
            {
                code: "INVALID_CONFIG_KIND",
                message: "Configuration kind must be legacy-fern or sdk-config-v1",
                cutoverVersion: route.cutoverVersion,
                expectedLanguage: route.language,
                expectedConfigKind: route.configKind,
                recommendedAction: "USE_SUPPORTED_CONFIG_KIND"
            },
            receivedConfigKind
        );
    }
    if (receivedConfigKind !== route.configKind) {
        const policy = getGeneratorPolicy(input.generatorId);
        if (policy === undefined) {
            throw new Error(`Missing validated generator policy for ${input.generatorId}`);
        }
        throw configKindError(input, policy, route.configKind, receivedConfigKind);
    }
    return route;
}

/** Selects the only compatible config and payload route for an exact generator version. */
export function selectGeneratorConfigRoute(input: SelectGeneratorConfigRouteInput): GenerationConfigRoute {
    const policy = getGeneratorPolicy(input.generatorId);
    if (policy === undefined) {
        throw compatibilityError(input, {
            code: "UNKNOWN_GENERATOR",
            message: `Unknown first-party generator: ${input.generatorId}`,
            cutoverVersion: null,
            expectedLanguage: null,
            expectedConfigKind: null,
            recommendedAction: "USE_KNOWN_GENERATOR_ID"
        });
    }

    if (policy.language !== input.language) {
        throw compatibilityError(input, {
            code: "GENERATOR_LANGUAGE_MISMATCH",
            message: `Generator ${input.generatorId} targets ${policy.language}, not ${input.language}`,
            cutoverVersion: policy.cutoverVersion,
            expectedLanguage: policy.language,
            expectedConfigKind: null,
            recommendedAction: "USE_GENERATOR_LANGUAGE"
        });
    }

    const requestedVersion = parseExactSemver(input.requestedVersion);
    if (requestedVersion === null) {
        throw compatibilityError(input, {
            code: "INVALID_GENERATOR_VERSION",
            message: `Generator version must be an exact semantic version: ${input.requestedVersion}`,
            cutoverVersion: policy.cutoverVersion,
            expectedLanguage: policy.language,
            expectedConfigKind: null,
            recommendedAction: "USE_EXACT_GENERATOR_VERSION"
        });
    }

    const isBeforeCutover = compareSemver(requestedVersion, policy.parsedCutoverVersion) < 0;
    const expectedConfigKind = isBeforeCutover ? "legacy-fern" : "sdk-config-v1";

    return {
        generatorId: input.generatorId,
        language: policy.language,
        requestedVersion: input.requestedVersion,
        cutoverVersion: policy.cutoverVersion,
        configKind: expectedConfigKind,
        payloadKind: isBeforeCutover ? "fern-runtime-bundle" : "sdk-config-v1"
    };
}

function compatibilityError(
    input: SelectGeneratorConfigRouteInput & { configKind?: unknown },
    details: Omit<
        GeneratorConfigCompatibilityErrorInput,
        "generatorId" | "language" | "requestedVersion" | "receivedConfigKind"
    >,
    receivedConfigKind: unknown = input.configKind
): GeneratorConfigCompatibilityError {
    return new GeneratorConfigCompatibilityError({
        generatorId: input.generatorId,
        language: input.language,
        requestedVersion: input.requestedVersion,
        receivedConfigKind,
        ...details
    });
}

function configKindError(
    input: ValidateGeneratorConfigCompatibilityInput,
    policy: GeneratorPolicy,
    expectedConfigKind: GenerationConfigKind,
    receivedConfigKind: GenerationConfigKind
): GeneratorConfigCompatibilityError {
    const requiresLegacy = expectedConfigKind === "legacy-fern";
    return compatibilityError(
        input,
        {
            code: requiresLegacy ? "LEGACY_FERN_CONFIG_REQUIRED" : "SDK_CONFIG_V1_REQUIRED",
            message: requiresLegacy
                ? `Generator ${input.generatorId} ${input.requestedVersion} requires legacy Fern configuration`
                : `Generator ${input.generatorId} ${input.requestedVersion} requires SDK Config v1`,
            cutoverVersion: policy.cutoverVersion,
            expectedLanguage: policy.language,
            expectedConfigKind,
            recommendedAction: requiresLegacy ? "USE_LEGACY_FERN_CONFIG" : "USE_SDK_CONFIG_V1"
        },
        receivedConfigKind
    );
}

function isGenerationConfigKind(value: unknown): value is GenerationConfigKind {
    return value === "legacy-fern" || value === "sdk-config-v1";
}
