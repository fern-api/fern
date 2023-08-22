import { GeneratorName } from "@fern-api/generators-configuration";
import { isVersionAhead } from "@fern-api/semver-utils";
import { TaskContext } from "@fern-api/task-context";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { GeneratorNameAndVersion } from "./IrMigrationContext";
import { V10_TO_V9_MIGRATION } from "./migrations/v10-to-v9/migrateFromV10ToV9";
import { V11_TO_V10_MIGRATION } from "./migrations/v11-to-v10/migrateFromV11ToV10";
import { V12_TO_V11_MIGRATION } from "./migrations/v12-to-v11/migrateFromV12ToV11";
import { V13_TO_V12_MIGRATION } from "./migrations/v13-to-v12/migrateFromV13ToV12";
import { V14_TO_V13_MIGRATION } from "./migrations/v14-to-v13/migrateFromV14ToV13";
import { V15_TO_V14_MIGRATION } from "./migrations/v15-to-v14/migrateFromV15ToV14";
import { V16_TO_V15_MIGRATION } from "./migrations/v16-to-v15/migrateFromV16ToV15";
import { V17_TO_V16_MIGRATION } from "./migrations/v17-to-v16/migrateFromV17ToV16";
import { V18_TO_V17_MIGRATION } from "./migrations/v18-to-v17/migrateFromV18ToV17";
import { V19_TO_V18_MIGRATION } from "./migrations/v19-to-v18/migrateFromV19ToV18";
import { V2_TO_V1_MIGRATION } from "./migrations/v2-to-v1/migrateFromV2ToV1";
import { V20_TO_V19_MIGRATION } from "./migrations/v20-to-v19/migrateFromV20ToV19";
import { V21_TO_V20_MIGRATION } from "./migrations/v21-to-v20/migrateFromV21ToV20";
import { V22_TO_V21_MIGRATION } from "./migrations/v22-to-v21/migrateFromV22ToV21";
import { V23_TO_V22_MIGRATION } from "./migrations/v23-to-v22/migrateFromV23ToV22";
import { V24_TO_V23_MIGRATION } from "./migrations/v24-to-v23/migrateFromV24ToV23";
import { V3_TO_V2_MIGRATION } from "./migrations/v3-to-v2/migrateFromV3ToV2";
import { V4_TO_V3_MIGRATION } from "./migrations/v4-to-v3/migrateFromV4ToV3";
import { V5_TO_V4_MIGRATION } from "./migrations/v5-to-v4/migrateFromV5ToV4";
import { V6_TO_V5_MIGRATION } from "./migrations/v6-to-v5/migrateFromV6ToV5";
import { V7_TO_V6_MIGRATION } from "./migrations/v7-to-v6/migrateFromV7ToV6";
import { V8_TO_V7_MIGRATION } from "./migrations/v8-to-v7/migrateFromV8ToV7";
import { V9_TO_V8_MIGRATION } from "./migrations/v9-to-v8/migrateFromV9ToV8";
import { GeneratorWasNeverUpdatedToConsumeNewIR, GeneratorWasNotCreatedYet, IrMigration } from "./types/IrMigration";

export function getIntermediateRepresentationMigrator(): IntermediateRepresentationMigrator {
    return INTERMEDIATE_REPRESENTATION_MIGRATOR;
}

export interface IntermediateRepresentationMigrator {
    readonly migrations: IrMigration<unknown, unknown>[];
    migrateForGenerator: (args: {
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion;
    }) => MigratedIntermediateMigration<unknown>;
    migrateThroughMigration<LaterVersion, EarlierVersion>(args: {
        migration: IrMigration<LaterVersion, EarlierVersion>;
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion;
    }): MigratedIntermediateMigration<EarlierVersion>;
    migrateThroughVersion<Migrated>(args: {
        version: string;
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator?: GeneratorNameAndVersion;
    }): MigratedIntermediateMigration<Migrated>;
}

export interface MigratedIntermediateMigration<Migrated> {
    ir: Migrated;
    jsonify: () => Promise<unknown>;
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
    }): MigratedIntermediateMigration<unknown> {
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
    }): MigratedIntermediateMigration<EarlierVersion> {
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
    }): MigratedIntermediateMigration<Migrated> {
        let hasEncouneredMigrationYet = false;

        const migrated = this.migrate<Migrated>({
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

        return migrated;
    }

    private migrate<Migrated>({
        intermediateRepresentation,
        shouldMigrate,
        context,
        targetGenerator,
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        shouldMigrate: (migration: IrMigration<unknown, unknown>) => boolean;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion | undefined;
    }): MigratedIntermediateMigration<Migrated> {
        let migrated: unknown = intermediateRepresentation;
        let jsonify: () => Promise<unknown> = () =>
            IrSerialization.IntermediateRepresentation.jsonOrThrow(migrated, {
                unrecognizedObjectKeys: "strip",
            });

        for (const migration of this.migrations) {
            if (!shouldMigrate(migration)) {
                break;
            }
            context.logger.debug(`Migrating IR from ${migration.laterVersion} to ${migration.earlierVersion}`);
            migrated = migration.migrateBackwards(migrated, {
                taskContext: context,
                targetGenerator,
            });
            jsonify = () => Promise.resolve().then(() => migration.jsonifyEarlierVersion(migrated));
        }

        return {
            ir: migrated as Migrated,
            jsonify,
        };
    }

    private shouldRunMigration({
        migration,
        targetGenerator,
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        migration: IrMigration<any, any>;
        targetGenerator: GeneratorNameAndVersion;
    }): boolean {
        const minVersionToExclude =
            migration.firstGeneratorVersionToConsumeNewIR[targetGenerator.name as GeneratorName];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (minVersionToExclude == null) {
            throw new Error(
                `Cannot migrate intermediate representation. Unrecognized generator: ${targetGenerator.name}.`
            );
        }

        switch (minVersionToExclude) {
            case GeneratorWasNeverUpdatedToConsumeNewIR:
                return true;
            case GeneratorWasNotCreatedYet:
                throw new Error(
                    `Cannot migrate intermediate representation. Generator was created after intermediate representation ${migration.laterVersion}.`
                );
        }

        return isVersionAhead(minVersionToExclude, targetGenerator.version);
    }
}

const IntermediateRepresentationMigrator = {
    Builder: new IntermediateRepresentationMigratorBuilderImpl<IntermediateRepresentation>([]),
};

const INTERMEDIATE_REPRESENTATION_MIGRATOR = IntermediateRepresentationMigrator.Builder
    // put new migrations here
    .withMigration(V24_TO_V23_MIGRATION)
    .withMigration(V23_TO_V22_MIGRATION)
    .withMigration(V22_TO_V21_MIGRATION)
    .withMigration(V21_TO_V20_MIGRATION)
    .withMigration(V20_TO_V19_MIGRATION)
    .withMigration(V19_TO_V18_MIGRATION)
    .withMigration(V18_TO_V17_MIGRATION)
    .withMigration(V17_TO_V16_MIGRATION)
    .withMigration(V16_TO_V15_MIGRATION)
    .withMigration(V15_TO_V14_MIGRATION)
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
