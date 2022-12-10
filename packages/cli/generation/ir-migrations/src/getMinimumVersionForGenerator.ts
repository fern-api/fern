import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";
import { GeneratorName } from "./types/GeneratorName";
import { AlwaysRunMigration } from "./types/IrMigration";

export function getMinimumVersionForGenerator({ generatorName }: { generatorName: string }): string | undefined {
    const { migrations } = getIntermediateRepresentationMigrator();

    for (const migration of migrations) {
        const version = migration.minGeneratorVersionsToExclude[generatorName as GeneratorName];
        if (version != null && version !== AlwaysRunMigration) {
            return version;
        }
    }

    return undefined;
}
