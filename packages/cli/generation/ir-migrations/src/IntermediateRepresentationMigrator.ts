import { isVersionAhead } from "@fern-api/semver-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { V2_TO_V1_MIGRATION } from "./migrations/v2-to-v1/migrateFromV2ToV1";
import { V3_TO_V2_MIGRATION } from "./migrations/v3-to-v2/migrateFromV3ToV2";
import { V4_TO_V3_MIGRATION } from "./migrations/v4-to-v3/migrateFromV4ToV3";
import { V5_TO_V4_MIGRATION } from "./migrations/v5-to-v4/migrateFromV5ToV4";
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
    migrateThroughMigration<LaterVersion, EarlierVersion>({
        migration,
        intermediateRepresentation,
    }: {
        migration: IrMigration<LaterVersion, EarlierVersion>;
        intermediateRepresentation: IntermediateRepresentation;
    }): EarlierVersion;
}

interface IntermediateRepresentationMigratorBuilder<LaterVersion> {
    withMigration: <EarlierVersion>(
        migration: IrMigration<LaterVersion, EarlierVersion>
    ) => BuildableIntermediateRepresentationMigratorBuilder<EarlierVersion>;
}

interface BuildableIntermediateRepresentationMigratorBuilder<LaterVersion>
    extends IntermediateRepresentationMigratorBuilder<LaterVersion> {
    build: () => IntermediateRepresentationMigrator;
}

class IntermediateRepresentationMigratorBuilderImpl<LaterVersion>
    implements IntermediateRepresentationMigratorBuilder<LaterVersion>
{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(protected readonly migrations: IrMigration<any, any>[]) {}

    public withMigration<EarlierVersion>(
        migration: IrMigration<LaterVersion, EarlierVersion>
    ): BuildableIntermediateRepresentationMigratorBuilder<EarlierVersion> {
        return new BuildaleIntermediateRepresentationMigratorBuilderImpl<EarlierVersion>([
            ...this.migrations,
            migration,
        ]);
    }
}

class BuildaleIntermediateRepresentationMigratorBuilderImpl<LaterVersion>
    extends IntermediateRepresentationMigratorBuilderImpl<LaterVersion>
    implements BuildableIntermediateRepresentationMigratorBuilder<LaterVersion>
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
        return this.migrate({
            intermediateRepresentation,
            shouldMigrate: (migration) => this.shouldRunMigration({ migration, generatorName, generatorVersion }),
        });
    }

    public migrateThroughMigration<LaterVersion, EarlierVersion>({
        migration,
        intermediateRepresentation,
    }: {
        migration: IrMigration<LaterVersion, EarlierVersion>;
        intermediateRepresentation: IntermediateRepresentation;
    }): EarlierVersion {
        let hasEncouneredMigrationYet = false;
        return this.migrate({
            intermediateRepresentation,
            shouldMigrate: (nextMigration) => {
                const isEncounteringMigration = nextMigration.earlierVersion === migration.earlierVersion;
                hasEncouneredMigrationYet ||= isEncounteringMigration;
                return isEncounteringMigration || !hasEncouneredMigrationYet;
            },
        }) as EarlierVersion;
    }

    private migrate({
        intermediateRepresentation,
        shouldMigrate,
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        shouldMigrate: (migration: IrMigration<unknown, unknown>) => boolean;
    }): unknown {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let migrated: any = intermediateRepresentation;
        for (const migration of this.migrations) {
            if (!shouldMigrate(migration)) {
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
        if (!(generatorName in migration.minGeneratorVersionsToExclude)) {
            throw new Error(`Cannot migrate intermediate representation. Unrecognized generator: ${generatorName}.`);
        }
        const minVersionToExclude = migration.minGeneratorVersionsToExclude[generatorName as GeneratorName];
        if (!minVersionToExclude) {
            return false;
        }

        return minVersionToExclude === AlwaysRunMigration || isVersionAhead(minVersionToExclude, generatorVersion);
    }
}

const IntermediateRepresentationMigrator = {
    Builder: new IntermediateRepresentationMigratorBuilderImpl<IntermediateRepresentation>([]),
};

const INTERMEDIATE_REPRESENTATION_MIGRATOR = IntermediateRepresentationMigrator.Builder
    // put new migrations here
    .withMigration(V5_TO_V4_MIGRATION)
    .withMigration(V4_TO_V3_MIGRATION)
    .withMigration(V3_TO_V2_MIGRATION)
    .withMigration(V2_TO_V1_MIGRATION)
    .build();
