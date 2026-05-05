import { generatorsYml } from "@fern-api/configuration";

import type { AnalyzeCommitDiffResponse, ConsolidateChangelogResponse } from "./types.js";

export interface BamlClientInstance {
    AnalyzeSdkDiff(
        diff: string,
        language: string,
        previousVersion: string,
        priorChangelog: string,
        specCommitMessage: string
    ): Promise<AnalyzeCommitDiffResponse>;
    ConsolidateChangelog(
        rawEntries: string,
        bestBump: string,
        language: string,
        previousVersion: string,
        projectedVersion: string
    ): Promise<ConsolidateChangelogResponse>;
    withOptions(options: { clientRegistry?: unknown }): BamlClientInstance;
}

export interface BamlDependencies {
    ClientRegistry: new () => ClientRegistryInstance;
    BamlClient: BamlClientInstance;
    configureBamlClient: (config: generatorsYml.AiServicesSchema) => ClientRegistryInstance;
}

export interface ClientRegistryInstance {
    addLlmClient(name: string, provider: string, options: Record<string, unknown>): void;
    setPrimary(name: string): void;
}

const INSTALL_MESSAGE =
    "@boundaryml/baml is required for AI features (auto-versioning, sdk-diff).\n" +
    "Install it with:\n" +
    "  npm install @boundaryml/baml\n" +
    "  pnpm add @boundaryml/baml";

/**
 * Lazily loads BAML dependencies at runtime.
 *
 * This uses dynamic import() so that @boundaryml/baml is only resolved when
 * AI features are actually invoked. Users who never use auto-versioning or
 * sdk-diff will not need the package installed.
 */
export async function loadBamlDependencies(): Promise<BamlDependencies> {
    try {
        const [baml, bamlClient, config] = await Promise.all([
            import("@boundaryml/baml"),
            import("./baml_client/index.js"),
            import("./configureBamlClient.js")
        ]);
        return {
            ClientRegistry: baml.ClientRegistry,
            BamlClient: bamlClient.b as BamlClientInstance,
            configureBamlClient: config.configureBamlClient
        };
    } catch (error) {
        const original = error instanceof Error ? error.message : String(error);
        throw new Error(`${INSTALL_MESSAGE}\n\nOriginal error: ${original}`);
    }
}
