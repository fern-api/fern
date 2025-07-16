import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { LegacyGenerators, MigratedGenerators } from ".";
import { DocsURL } from "../docs-config";
import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY } from "./legacy/GeneratorsConfigurationSchema";

export interface ConvertedGeneratorsConfiguration {
    value: MigratedGenerators.GeneratorsConfigurationSchema;
    docsURLs: DocsURL[];
}

export type PathModificationStrategy = (typeof PathModificationStrategy)[keyof typeof PathModificationStrategy];
export const PathModificationStrategy = {
    Nest: "Nest",
    MoveUp: "MoveUp"
} as const;

export function convertLegacyGeneratorsConfiguration({
    generatorsConfiguration,
    pathModificationStrategy
}: {
    generatorsConfiguration: LegacyGenerators.GeneratorsConfigurationSchema;
    pathModificationStrategy: PathModificationStrategy;
}): ConvertedGeneratorsConfiguration {
    const docsURLs: DocsURL[] = [];
    const convertedGeneratorsConfiguration: MigratedGenerators.GeneratorsConfigurationSchema = {
        "default-group": generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
        groups: Object.fromEntries(
            Object.entries(generatorsConfiguration.groups ?? {}).map(([name, group]) => {
                if (group.docs != null) {
                    docsURLs.push({
                        url: group.docs.domain,
                        customDomain: group.docs["custom-domains"]?.[0]
                    });
                }
                return [
                    name,
                    {
                        audiences: group.audiences,
                        generators: group.generators.map((generatorInvocation) =>
                            convertLegacyGeneratorsInvocation({ generatorInvocation, pathModificationStrategy })
                        )
                    }
                ];
            })
        )
    };
    return {
        value: convertedGeneratorsConfiguration,
        docsURLs
    };
}

function convertLegacyGeneratorsInvocation({
    generatorInvocation,
    pathModificationStrategy
}: {
    generatorInvocation: LegacyGenerators.GeneratorInvocationSchema;
    pathModificationStrategy: PathModificationStrategy;
}): MigratedGenerators.GeneratorInvocationSchema {
    return {
        ...generatorInvocation,
        output:
            generatorInvocation.output?.location === "local-file-system"
                ? {
                      location: "local-file-system",
                      path: convertPath({ path: generatorInvocation.output.path, pathModificationStrategy })
                  }
                : generatorInvocation.output
    };
}

function convertPath({
    path,
    pathModificationStrategy
}: {
    path: string;
    pathModificationStrategy: PathModificationStrategy;
}): string {
    switch (pathModificationStrategy) {
        case "Nest":
            return join(RelativeFilePath.of("../"), RelativeFilePath.of(path));
        case "MoveUp":
            return path.startsWith("../") ? path.substring(3) : path;
        default:
            assertNever(pathModificationStrategy);
    }
}
