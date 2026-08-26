// cspell:ignore kotlin
import { type ParsedSemver, parseExactSemver } from "./exactSemver.js";
import type { GeneratorLanguage } from "./generatorConfigCompatibility.js";

interface GeneratorPolicyDefinition {
    language: GeneratorLanguage;
    cutoverVersion: string;
}

/** Validated internal policy associated with one first-party generator alias. */
export interface GeneratorPolicy extends GeneratorPolicyDefinition {
    parsedCutoverVersion: ParsedSemver;
}

type GeneratorPolicyEntry = readonly [string, GeneratorPolicyDefinition];

/** Typed startup failure for an invalid private generator cutover definition. */
export class GeneratorConfigPolicyInvariantError extends Error {
    public override readonly name = "GeneratorConfigPolicyInvariantError";
    public readonly code = "INVALID_GENERATOR_CUTOVER_POLICY";
    public readonly generatorId: string;
    public readonly language: GeneratorLanguage;
    public readonly cutoverVersion: string;
    public readonly retryable = false;
    public readonly recommendedAction = "FIX_GENERATOR_CUTOVER_POLICY";

    public constructor(generatorId: string, policy: GeneratorPolicyDefinition) {
        super(`Generator ${generatorId} has an invalid cutover version: ${policy.cutoverVersion}`);
        this.generatorId = generatorId;
        this.language = policy.language;
        this.cutoverVersion = policy.cutoverVersion;
    }
}

/** Internal constructor exported only for direct invariant testing. */
export function createGeneratorPolicies(
    entries: readonly GeneratorPolicyEntry[]
): ReadonlyMap<string, GeneratorPolicy> {
    return new Map(
        entries.map(([generatorId, policy]) => {
            const parsedCutoverVersion = parseExactSemver(policy.cutoverVersion);
            if (parsedCutoverVersion === null) {
                throw new GeneratorConfigPolicyInvariantError(generatorId, policy);
            }
            return [generatorId, { ...policy, parsedCutoverVersion }];
        })
    );
}

// This is the sole authority for first-party aliases and cutovers.
const GENERATOR_POLICIES = createGeneratorPolicies([
    ["fernapi/fern-typescript", { language: "typescript", cutoverVersion: "4.0.0" }],
    ["fernapi/fern-typescript-sdk", { language: "typescript", cutoverVersion: "4.0.0" }],
    ["fernapi/fern-typescript-node-sdk", { language: "typescript", cutoverVersion: "4.0.0" }],
    ["fernapi/fern-typescript-browser-sdk", { language: "typescript", cutoverVersion: "4.0.0" }],
    ["fernapi/fern-python-sdk", { language: "python", cutoverVersion: "6.0.0" }],
    ["fernapi/fern-java-sdk", { language: "java", cutoverVersion: "5.0.0" }],
    ["fernapi/fern-kotlin-sdk", { language: "kotlin", cutoverVersion: "5.0.0" }],
    ["fernapi/fern-go-sdk", { language: "go", cutoverVersion: "2.0.0" }],
    ["fernapi/fern-csharp-sdk", { language: "csharp", cutoverVersion: "3.0.0" }],
    ["fernapi/fern-php-sdk", { language: "php", cutoverVersion: "3.0.0" }],
    ["fernapi/fern-ruby-sdk", { language: "ruby", cutoverVersion: "2.0.0" }],
    ["fernapi/fern-ruby-sdk-v2", { language: "ruby", cutoverVersion: "2.0.0" }],
    ["fernapi/fern-rust-sdk", { language: "rust", cutoverVersion: "1.0.0" }],
    ["fernapi/fern-swift-sdk", { language: "swift", cutoverVersion: "1.0.0" }],
    ["fernapi/fern-cli", { language: "cli", cutoverVersion: "1.0.0" }],
    ["fernapi/fern-cli-generator", { language: "cli", cutoverVersion: "1.0.0" }],
    ["fernapi/fern-mcp-server", { language: "mcp", cutoverVersion: "0.1.0" }]
]);

/** Resolves one alias without exposing the private policy collection. */
export function getGeneratorPolicy(generatorId: string): GeneratorPolicy | undefined {
    return GENERATOR_POLICIES.get(generatorId);
}
