import { GeneratorName } from "@fern-api/generators-configuration";
import { isVersionAhead } from "@fern-api/semver-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { IrMigrationContext } from "./IrMigrationContext";
import { V2_TO_V1_MIGRATION } from "./migrations/v2-to-v1/migrateFromV2ToV1";
import { V3_TO_V2_MIGRATION } from "./migrations/v3-to-v2/migrateFromV3ToV2";
import { V4_TO_V3_MIGRATION } from "./migrations/v4-to-v3/migrateFromV4ToV3";
import { V5_TO_V4_MIGRATION } from "./migrations/v5-to-v4/migrateFromV5ToV4";
import { V6_TO_V5_MIGRATION } from "./migrations/v6-to-v5/migrateFromV6ToV5";
import { V7_TO_V6_MIGRATION } from "./migrations/v7-to-v6/migrateFromV7ToV6";
import { V8_TO_V7_MIGRATION } from "./migrations/v8-to-v7/migrateFromV8ToV7";
import { V9_TO_V8_MIGRATION } from "./migrations/v9-to-v8/migrateFromV9ToV8";
import { AlwaysRunMigration, IrMigration } from "./types/IrMigration";

export function getIntermediateRepresentationMigrator(): IntermediateRepresentationMigrator {
    return INTERMEDIATE_REPRESENTATION_MIGRATOR;
}

export interface IntermediateRepresentationMigrator {
    readonly migrations: IrMigration<unknown, unknown>[];
    migrateBackwards: ({
        intermediateRepresentation,
        context,
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        context: IrMigrationContext;
    }) => unknown;
    migrateThroughMigration<LaterVersion, EarlierVersion>({
        migration,
        intermediateRepresentation,
        context,
    }: {
        migration: IrMigration<LaterVersion, EarlierVersion>;
        intermediateRepresentation: IntermediateRepresentation;
        context: IrMigrationContext;
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
        intermediateRepresentation,
        context,
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        context: IrMigrationContext;
    }): unknown {
        return this.migrate({
            intermediateRepresentation,
            shouldMigrate: (migration) => this.shouldRunMigration({ migration, context }),
            context,
        });
    }

    public migrateThroughMigration<LaterVersion, EarlierVersion>({
        migration,
        intermediateRepresentation,
        context,
    }: {
        migration: IrMigration<LaterVersion, EarlierVersion>;
        intermediateRepresentation: IntermediateRepresentation;
        context: IrMigrationContext;
    }): EarlierVersion {
        let hasEncouneredMigrationYet = false;
        return this.migrate({
            intermediateRepresentation,
            shouldMigrate: (nextMigration) => {
                const isEncounteringMigration = nextMigration.earlierVersion === migration.earlierVersion;
                hasEncouneredMigrationYet ||= isEncounteringMigration;
                return isEncounteringMigration || !hasEncouneredMigrationYet;
            },
            context,
        }) as EarlierVersion;
    }

    private migrate({
        intermediateRepresentation,
        shouldMigrate,
        context,
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        shouldMigrate: (migration: IrMigration<unknown, unknown>) => boolean;
        context: IrMigrationContext;
    }): unknown {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let migrated: any = intermediateRepresentation;
        for (const migration of this.migrations) {
            if (!shouldMigrate(migration)) {
                break;
            }
            migrated = migration.migrateBackwards(migrated, context);
        }
        return migrated;
    }

    private shouldRunMigration({
        migration,
        context,
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        migration: IrMigration<any, any>;
        context: IrMigrationContext;
    }): boolean {
        if (!(context.targetGenerator.name in migration.minGeneratorVersionsToExclude)) {
            throw new Error(
                `Cannot migrate intermediate representation. Unrecognized generator: ${context.targetGenerator.name}.`
            );
        }
        const minVersionToExclude =
            migration.minGeneratorVersionsToExclude[context.targetGenerator.name as GeneratorName];
        if (!minVersionToExclude) {
            return false;
        }

        return (
            minVersionToExclude === AlwaysRunMigration ||
            isVersionAhead(minVersionToExclude, context.targetGenerator.version)
        );
    }
}

const IntermediateRepresentationMigrator = {
    Builder: new IntermediateRepresentationMigratorBuilderImpl<IntermediateRepresentation>([]),
};

const INTERMEDIATE_REPRESENTATION_MIGRATOR = IntermediateRepresentationMigrator.Builder
    // put new migrations here
    .withMigration(V9_TO_V8_MIGRATION)
    .withMigration(V8_TO_V7_MIGRATION)
    .withMigration(V7_TO_V6_MIGRATION)
    .withMigration(V6_TO_V5_MIGRATION)
    .withMigration(V5_TO_V4_MIGRATION)
    .withMigration(V4_TO_V3_MIGRATION)
    .withMigration(V3_TO_V2_MIGRATION)
    .withMigration(V2_TO_V1_MIGRATION)
    .build();
