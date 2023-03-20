import { GeneratorName } from "@fern-api/generators-configuration";
import { isVersionAhead } from "@fern-api/semver-utils";
import { TaskContext } from "@fern-api/task-context";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { GeneratorNameAndVersion } from "./IrMigrationContext";
import { V10_TO_V9_MIGRATION } from "./migrations/v10-to-v9/migrateFromV10ToV9";
import { V11_TO_V10_MIGRATION } from "./migrations/v11-to-v10/migrateFromV11ToV10";
import { V12_TO_V11_MIGRATION } from "./migrations/v12-to-v11/migrateFromV12ToV11";
import { V13_TO_V12_MIGRATION } from "./migrations/v13-to-v12/migrateFromV13ToV12";
import { V14_TO_V13_MIGRATION } from "./migrations/v14-to-v13/migrateFromV14ToV13";
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
    migrateForGenerator: (args: {
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion;
    }) => unknown;
    migrateThroughMigration<LaterVersion, EarlierVersion>(args: {
        migration: IrMigration<LaterVersion, EarlierVersion>;
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion;
    }): EarlierVersion;
    migrateThroughVersion<Migrated>(args: {
        version: string;
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator?: GeneratorNameAndVersion;
    }): Migrated;
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

    public migrateForGenerator({
        intermediateRepresentation,
        context,
        targetGenerator,
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion;
    }): unknown {
        return this.migrate({
            intermediateRepresentation,
            shouldMigrate: (migration) => this.shouldRunMigration({ migration, targetGenerator }),
            context,
            targetGenerator,
        });
    }

    public migrateThroughMigration<LaterVersion, EarlierVersion>({
        migration,
        intermediateRepresentation,
        context,
        targetGenerator,
    }: {
        migration: IrMigration<LaterVersion, EarlierVersion>;
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion;
    }): EarlierVersion {
        return this.migrateThroughVersion({
            version: migration.earlierVersion,
            intermediateRepresentation,
            context,
            targetGenerator,
        });
    }

    public migrateThroughVersion<Migrated>({
        version,
        intermediateRepresentation,
        context,
        targetGenerator,
    }: {
        version: string;
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator?: GeneratorNameAndVersion;
    }): Migrated {
        let hasEncouneredMigrationYet = false;

        const migrated = this.migrate({
            intermediateRepresentation,
            shouldMigrate: (nextMigration) => {
                const isEncounteringMigration = nextMigration.earlierVersion === version;
                hasEncouneredMigrationYet ||= isEncounteringMigration;
                return isEncounteringMigration || !hasEncouneredMigrationYet;
            },
            context,
            targetGenerator,
        });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!hasEncouneredMigrationYet) {
            context.failAndThrow(`IR ${version} does not exist`);
        }

        return migrated as Migrated;
    }

    private migrate({
        intermediateRepresentation,
        shouldMigrate,
        context,
        targetGenerator,
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        shouldMigrate: (migration: IrMigration<unknown, unknown>) => boolean;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion | undefined;
    }): unknown {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let migrated: any = intermediateRepresentation;
        for (const migration of this.migrations) {
            if (!shouldMigrate(migration)) {
                break;
            }
            context.logger.debug(`Migrating IR from ${migration.laterVersion} to ${migration.earlierVersion}`);
            migrated = migration.migrateBackwards(migrated, {
                taskContext: context,
                targetGenerator,
            });
        }
        return migrated;
    }

    private shouldRunMigration({
        migration,
        targetGenerator,
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        migration: IrMigration<any, any>;
        targetGenerator: GeneratorNameAndVersion;
    }): boolean {
        if (!(targetGenerator.name in migration.minGeneratorVersionsToExclude)) {
            throw new Error(
                `Cannot migrate intermediate representation. Unrecognized generator: ${targetGenerator.name}.`
            );
        }
        const minVersionToExclude = migration.minGeneratorVersionsToExclude[targetGenerator.name as GeneratorName];
        if (!minVersionToExclude) {
            return false;
        }

        return (
            minVersionToExclude === AlwaysRunMigration || isVersionAhead(minVersionToExclude, targetGenerator.version)
        );
    }
}

const IntermediateRepresentationMigrator = {
    Builder: new IntermediateRepresentationMigratorBuilderImpl<IntermediateRepresentation>([]),
};

const INTERMEDIATE_REPRESENTATION_MIGRATOR = IntermediateRepresentationMigrator.Builder
    // put new migrations here
    .withMigration(V14_TO_V13_MIGRATION)
    .withMigration(V13_TO_V12_MIGRATION)
    .withMigration(V12_TO_V11_MIGRATION)
    .withMigration(V11_TO_V10_MIGRATION)
    .withMigration(V10_TO_V9_MIGRATION)
    .withMigration(V9_TO_V8_MIGRATION)
    .withMigration(V8_TO_V7_MIGRATION)
    .withMigration(V7_TO_V6_MIGRATION)
    .withMigration(V6_TO_V5_MIGRATION)
    .withMigration(V5_TO_V4_MIGRATION)
    .withMigration(V4_TO_V3_MIGRATION)
    .withMigration(V3_TO_V2_MIGRATION)
    .withMigration(V2_TO_V1_MIGRATION)
    .build();
