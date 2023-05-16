import { GeneratorName } from "@fern-api/generators-configuration";
import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";

export function getMinimumVersionForGenerator({ generatorName }: { generatorName: string }): string | undefined {
    const { migrations } = getIntermediateRepresentationMigrator();

    for (const migration of migrations) {
        const version = migration.minGeneratorVersionsToExclude[generatorName as GeneratorName];
        if (typeof version === "string") {
            return version;
        }
    }

    return undefined;
}
