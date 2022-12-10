import { isVersionAhead } from "@fern-api/semver-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { V2_TO_V1_MIGRATION } from "./migrations/ir-v1/migrateFromV2ToV1";
import { GeneratorName } from "./types/GeneratorName";
import { AlwaysRunMigration, IrMigration } from "./types/IrMigration";

export function getIntermediateRepresentationMigrator(): IntermediateRepresentationMigrator {
    return INTERMEDIATE_REPRESENTATION_MIGRATOR;
}

export interface IntermediateRepresentationMigrator {
    readonly migrations: IrMigration<unknown, unknown>[];
    migrateBackwards: ({
        generatorName,
        generatorVersion,
        intermediateRepresentation,
    }: {
        generatorName: string;
        generatorVersion: string;
        intermediateRepresentation: IntermediateRepresentation;
    }) => unknown;
}

interface IntermediateRepresentationMigratorBuilder<Next> {
    withMigration: <Previous>(
        migration: IrMigration<Next, Previous>
    ) => BuildableIntermediateRepresentationMigratorBuilder<Previous>;
}

interface BuildableIntermediateRepresentationMigratorBuilder<Next>
    extends IntermediateRepresentationMigratorBuilder<Next> {
    build: () => IntermediateRepresentationMigrator;
}

class IntermediateRepresentationMigratorBuilderImpl<Next> implements IntermediateRepresentationMigratorBuilder<Next> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(protected readonly migrations: IrMigration<any, any>[]) {}

    public withMigration<Previous>(
        migration: IrMigration<Next, Previous>
    ): BuildableIntermediateRepresentationMigratorBuilder<Previous> {
        return new BuildaleIntermediateRepresentationMigratorBuilderImpl<Previous>([...this.migrations, migration]);
    }
}

class BuildaleIntermediateRepresentationMigratorBuilderImpl<Next>
    extends IntermediateRepresentationMigratorBuilderImpl<Next>
    implements BuildableIntermediateRepresentationMigratorBuilder<Next>
{
    public build(): IntermediateRepresentationMigrator {
        return new IntermediateRepresentationMigratorImpl(this.migrations);
    }
}

class IntermediateRepresentationMigratorImpl implements IntermediateRepresentationMigrator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(public readonly migrations: IrMigration<any, any>[]) {}

    public migrateBackwards({
        generatorName,
        generatorVersion,
        intermediateRepresentation,
    }: {
        generatorName: string;
        generatorVersion: string;
        intermediateRepresentation: IntermediateRepresentation;
    }): unknown {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let migrated: any = intermediateRepresentation;
        for (const migration of this.migrations) {
            if (!this.shouldRunMigration({ migration, generatorName, generatorVersion })) {
                break;
            }
            migrated = migration.migrateBackwards(migrated);
        }
        return migrated;
    }

    private shouldRunMigration({
        migration,
        generatorName,
        generatorVersion,
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        migration: IrMigration<any, any>;
        generatorName: string;
        generatorVersion: string;
    }): boolean {
        if (!(generatorName in migration.requiredForGeneratorVersions)) {
            throw new Error(`Cannot migrate intermediate representation. Unrecognized generator: ${generatorName}.`);
        }
        const maxVersionToMigrateTo = migration.requiredForGeneratorVersions[generatorName as GeneratorName];
        if (!maxVersionToMigrateTo) {
            return false;
        }

        return maxVersionToMigrateTo === AlwaysRunMigration || !isVersionAhead(generatorVersion, maxVersionToMigrateTo);
    }
}

const IntermediateRepresentationMigrator = {
    Builder: new IntermediateRepresentationMigratorBuilderImpl<IntermediateRepresentation>([]),
};

const INTERMEDIATE_REPRESENTATION_MIGRATOR =
    IntermediateRepresentationMigrator.Builder.withMigration(V2_TO_V1_MIGRATION).build();
