import { FernRegistry, FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";

import { CliContext } from "../../cli-context/CliContext";

export interface GeneratorInfo {
    id: string;
    name: string;
    type: string;
    language?: string;
    version?: string;
    dockerImage: string;
}

export async function listGenerators({
    cliContext,
    typeFilter
}: {
    cliContext: CliContext;
    typeFilter?: string;
}): Promise<void> {
    const client = new GeneratorsClient({
        environment: process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com"
    });

    try {
        // Get all generators from the registry
        const generatorsResponse = await client.generators.listGenerators();

        if (!generatorsResponse.ok) {
            cliContext.failAndThrow("Failed to fetch generators from registry");
            return;
        }

        const generators = generatorsResponse.body;
        const generatorInfos: GeneratorInfo[] = [];

        // Process each generator and get latest version
        await Promise.all(
            generators.map(async (generator) => {
                try {
                    // Get latest version for each generator
                    const versionResponse = await client.generators.versions.getLatestGeneratorRelease({
                        generator: generator.id,
                        releaseTypes: [FernRegistry.generators.ReleaseType.Ga, FernRegistry.generators.ReleaseType.Rc],
                        cliVersion: cliContext.environment.packageVersion
                    });

                    const version = versionResponse.ok ? versionResponse.body.version : undefined;

                    // Get generator type as string
                    const type = getGeneratorTypeString(generator.generatorType);

                    const generatorInfo: GeneratorInfo = {
                        id: generator.id,
                        name: generator.displayName,
                        type,
                        language: generator.generatorLanguage,
                        version,
                        dockerImage: generator.dockerImage
                    };

                    // Apply type filter if specified
                    if (!typeFilter || type === typeFilter) {
                        generatorInfos.push(generatorInfo);
                    }
                } catch (error) {
                    // If we can't get version info for a generator, still include it without version
                    const type = getGeneratorTypeString(generator.generatorType);

                    const generatorInfo: GeneratorInfo = {
                        id: generator.id,
                        name: generator.displayName,
                        type,
                        language: generator.generatorLanguage,
                        version: undefined,
                        dockerImage: generator.dockerImage
                    };

                    // Apply type filter if specified
                    if (!typeFilter || type === typeFilter) {
                        generatorInfos.push(generatorInfo);
                    }
                }
            })
        );

        // Sort generators by type, then by language, then by name
        generatorInfos.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type.localeCompare(b.type);
            }
            if (a.language !== b.language) {
                if (!a.language) {
                    return 1;
                }
                if (!b.language) {
                    return -1;
                }
                return a.language.localeCompare(b.language);
            }
            return a.name.localeCompare(b.name);
        });

        // Output as table
        displayGeneratorsTable(generatorInfos, cliContext);
    } catch (error) {
        cliContext.failAndThrow("Failed to fetch generators from registry", error);
    }
}

function getGeneratorTypeString(generatorType: FernRegistry.generators.GeneratorType): string {
    return generatorType.type;
}

function displayGeneratorsTable(generators: GeneratorInfo[], cliContext: CliContext): void {
    if (generators.length === 0) {
        cliContext.logger.info("No generators found.");
        return;
    }

    // Calculate column widths
    const idWidth = Math.max(2, Math.max(...generators.map((g) => g.id.length)));
    const nameWidth = Math.max(4, Math.max(...generators.map((g) => g.name.length)));
    const typeWidth = Math.max(4, Math.max(...generators.map((g) => g.type.length)));
    const languageWidth = Math.max(8, Math.max(...generators.map((g) => g.language?.length ?? 0)));
    const versionWidth = Math.max(7, Math.max(...generators.map((g) => g.version?.length ?? 0)));
    const dockerImageWidth = Math.max(12, Math.max(...generators.map((g) => g.dockerImage.length)));

    // Create table header
    const header = `| ${padRight("ID", idWidth)} | ${padRight("Name", nameWidth)} | ${padRight("Type", typeWidth)} | ${padRight("Language", languageWidth)} | ${padRight("Version", versionWidth)} | ${padRight("Docker Image", dockerImageWidth)} |`;
    const separator = `|${"-".repeat(idWidth + 2)}|${"-".repeat(nameWidth + 2)}|${"-".repeat(typeWidth + 2)}|${"-".repeat(languageWidth + 2)}|${"-".repeat(versionWidth + 2)}|${"-".repeat(dockerImageWidth + 2)}|`;

    cliContext.logger.info(header);
    cliContext.logger.info(separator);

    // Output each generator row
    for (const generator of generators) {
        const row = `| ${padRight(generator.id, idWidth)} | ${padRight(generator.name, nameWidth)} | ${padRight(generator.type, typeWidth)} | ${padRight(generator.language ?? "", languageWidth)} | ${padRight(generator.version ?? "", versionWidth)} | ${padRight(generator.dockerImage, dockerImageWidth)} |`;
        cliContext.logger.info(row);
    }
}

function padRight(text: string, width: number): string {
    return text.padEnd(width);
}
