import { GeneratorName } from "@fern-api/configuration-loader";

import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";

export function getMinimumVersionForGenerator({ generatorName }: { generatorName: string }): string | undefined {
    const { migrations } = getIntermediateRepresentationMigrator();

    for (const migration of migrations) {
        const version = migration.firstGeneratorVersionToConsumeNewIR[generatorName as GeneratorName];
        if (typeof version === "string") {
            return version;
        }
    }

    return undefined;
}
