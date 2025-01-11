import { GeneratorName } from "@fern-api/configuration-loader";
import { IntermediateRepresentation, serialization as IrSerialization } from "@fern-api/ir-sdk";
import { isVersionAhead } from "@fern-api/semver-utils";
import { TaskContext } from "@fern-api/task-context";

import { GeneratorNameAndVersion } from "./IrMigrationContext";
import { V2_TO_V1_MIGRATION } from "./migrations/v2-to-v1/migrateFromV2ToV1";
import { V3_TO_V2_MIGRATION } from "./migrations/v3-to-v2/migrateFromV3ToV2";
import { V4_TO_V3_MIGRATION } from "./migrations/v4-to-v3/migrateFromV4ToV3";
import { V5_TO_V4_MIGRATION } from "./migrations/v5-to-v4/migrateFromV5ToV4";
import { V6_TO_V5_MIGRATION } from "./migrations/v6-to-v5/migrateFromV6ToV5";
import { V7_TO_V6_MIGRATION } from "./migrations/v7-to-v6/migrateFromV7ToV6";
import { V8_TO_V7_MIGRATION } from "./migrations/v8-to-v7/migrateFromV8ToV7";
import { V9_TO_V8_MIGRATION } from "./migrations/v9-to-v8/migrateFromV9ToV8";
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
import { V20_TO_V19_MIGRATION } from "./migrations/v20-to-v19/migrateFromV20ToV19";
import { V21_TO_V20_MIGRATION } from "./migrations/v21-to-v20/migrateFromV21ToV20";
import { V22_TO_V21_MIGRATION } from "./migrations/v22-to-v21/migrateFromV22ToV21";
import { V23_TO_V22_MIGRATION } from "./migrations/v23-to-v22/migrateFromV23ToV22";
import { V24_TO_V23_MIGRATION } from "./migrations/v24-to-v23/migrateFromV24ToV23";
import { V25_TO_V24_MIGRATION } from "./migrations/v25-to-v24/migrateFromV25ToV24";
import { V26_TO_V25_MIGRATION } from "./migrations/v26-to-v25/migrateFromV26ToV25";
import { V27_TO_V26_MIGRATION } from "./migrations/v27-to-v26/migrateFromV27-to-v26";
import { V28_TO_V27_MIGRATION } from "./migrations/v28-to-v27/migrateFromV28ToV27";
import { V29_TO_V28_MIGRATION } from "./migrations/v29-to-v28/migrateFromV29ToV28";
import { V30_TO_V29_MIGRATION } from "./migrations/v30-to-v29/migrateFromV30ToV29";
import { V31_TO_V30_MIGRATION } from "./migrations/v31-to-v30/migrateFromV31ToV30";
import { V32_TO_V31_MIGRATION } from "./migrations/v32-to-v31/migrateFromV32ToV31";
import { V33_TO_V32_MIGRATION } from "./migrations/v33-to-v32/migrateFromV33ToV32";
import { V34_TO_V33_MIGRATION } from "./migrations/v34-to-v33/migrateFromV34ToV33";
import { V35_TO_V34_MIGRATION } from "./migrations/v35-to-v34/migrateFromV35ToV34";
import { V36_TO_V35_MIGRATION } from "./migrations/v36-to-v35/migrateFromV36ToV35";
import { V37_TO_V36_MIGRATION } from "./migrations/v37-to-v36/migrateFromV37ToV36";
import { V38_TO_V37_MIGRATION } from "./migrations/v38-to-v37/migrateFromV38ToV37";
import { V39_TO_V38_MIGRATION } from "./migrations/v39-to-v38/migrateFromV39ToV38";
import { V40_TO_V39_MIGRATION } from "./migrations/v40-to-v39/migrateFromV40ToV39";
import { V41_TO_V40_MIGRATION } from "./migrations/v41-to-v40/migrateFromV41ToV40";
import { V42_TO_V41_MIGRATION } from "./migrations/v42-to-v41/migrateFromV42ToV41";
import { V43_TO_V42_MIGRATION } from "./migrations/v43-to-v42/migrateFromV43ToV42";
import { V44_TO_V43_MIGRATION } from "./migrations/v44-to-v43/migrateFromV44ToV43";
import { V45_TO_V44_MIGRATION } from "./migrations/v45-to-v44/migrateFromV45ToV44";
import { V46_TO_V45_MIGRATION } from "./migrations/v46-to-v45/migrateFromV46ToV45";
import { V47_TO_V46_MIGRATION } from "./migrations/v47-to-v46/migrateFromV47ToV46";
import { V48_TO_V47_MIGRATION } from "./migrations/v48-to-v47/migrateFromV48ToV47";
import { V49_TO_V48_MIGRATION } from "./migrations/v49-to-v48/migrateFromV49ToV48";
import { V50_TO_V49_MIGRATION } from "./migrations/v50-to-v49/migrateFromV50ToV49";
import { V51_TO_V50_MIGRATION } from "./migrations/v51-to-v50/migrateFromV51ToV50";
import { V52_TO_V51_MIGRATION } from "./migrations/v52-to-v51/migrateFromV52ToV51";
import { V53_TO_V52_MIGRATION } from "./migrations/v53-to-v52/migrateFromV53ToV52";
import { V54_TO_V53_MIGRATION } from "./migrations/v54-to-v53/migrateFromV54ToV53";
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
    getIRVersionForGenerator(args: { targetGenerator: GeneratorNameAndVersion }): string | undefined;
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
            migration
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
        targetGenerator
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion;
    }): MigratedIntermediateMigration<unknown> {
        return this.migrate({
            intermediateRepresentation,
            shouldMigrate: (migration) => this.shouldRunMigration({ migration, targetGenerator }),
            context,
            targetGenerator
        });
    }

    public migrateThroughMigration<LaterVersion, EarlierVersion>({
        migration,
        intermediateRepresentation,
        context,
        targetGenerator
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
            targetGenerator
        });
    }

    public migrateThroughVersion<Migrated>({
        version,
        intermediateRepresentation,
        context,
        targetGenerator
    }: {
        version: string;
        intermediateRepresentation: IntermediateRepresentation;
        context: TaskContext;
        targetGenerator?: GeneratorNameAndVersion;
    }): MigratedIntermediateMigration<Migrated> {
        let hasEncouneredMigrationYet = false;

        const versionIsLatest = this.migrations[0]?.laterVersion === version;
        if (versionIsLatest) {
            return {
                ir: intermediateRepresentation as unknown as Migrated,
                jsonify: () =>
                    Promise.resolve().then(() =>
                        IrSerialization.IntermediateRepresentation.jsonOrThrow(intermediateRepresentation, {
                            unrecognizedObjectKeys: "strip"
                        })
                    )
            };
        }

        const migrated = this.migrate<Migrated>({
            intermediateRepresentation,
            shouldMigrate: (nextMigration) => {
                const isEncounteringMigration = nextMigration.earlierVersion === version;
                hasEncouneredMigrationYet ||= isEncounteringMigration;
                return isEncounteringMigration || !hasEncouneredMigrationYet;
            },
            context,
            targetGenerator
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
        targetGenerator
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        shouldMigrate: (migration: IrMigration<unknown, unknown>) => boolean;
        context: TaskContext;
        targetGenerator: GeneratorNameAndVersion | undefined;
    }): MigratedIntermediateMigration<Migrated> {
        let migrated: unknown = intermediateRepresentation;
        let jsonify: () => Promise<unknown> = async () => {
            return await IrSerialization.IntermediateRepresentation.jsonOrThrow(migrated, {
                unrecognizedObjectKeys: "strip"
            });
        };
        for (const migration of this.migrations) {
            if (!shouldMigrate(migration)) {
                break;
            }
            context.logger.debug(`Migrating IR from ${migration.laterVersion} to ${migration.earlierVersion}`);
            migrated = migration.migrateBackwards(migrated, {
                taskContext: context,
                targetGenerator
            });
            jsonify = () => Promise.resolve().then(() => migration.jsonifyEarlierVersion(migrated));
        }

        return {
            ir: migrated as Migrated,
            jsonify
        };
    }

    private shouldRunMigration({
        migration,
        targetGenerator
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        migration: IrMigration<any, any>;
        targetGenerator: GeneratorNameAndVersion;
    }): boolean {
        const minVersionToExclude =
            migration.firstGeneratorVersionToConsumeNewIR[targetGenerator.name as GeneratorName];

        if (minVersionToExclude == null) {
            throw new Error(
                `Cannot migrate intermediate representation. Unrecognized generator: ${targetGenerator.name}. If leveraging a custom generator, ensure you are specifying "ir-version" within the generator configuration.`
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

    public getIRVersionForGenerator({
        targetGenerator
    }: {
        targetGenerator: GeneratorNameAndVersion;
    }): string | undefined {
        let lastIrVersion = this.migrations[0]?.laterVersion;
        for (const migration of this.migrations) {
            if (this.shouldRunMigration({ migration, targetGenerator })) {
                lastIrVersion = migration.earlierVersion;
            } else {
                break;
            }
        }
        return lastIrVersion;
    }
}

const IntermediateRepresentationMigrator = {
    Builder: new IntermediateRepresentationMigratorBuilderImpl<IntermediateRepresentation>([])
};

export const INTERMEDIATE_REPRESENTATION_MIGRATOR = IntermediateRepresentationMigrator.Builder
    // put new migrations here
    .withMigration(V54_TO_V53_MIGRATION)
    .withMigration(V53_TO_V52_MIGRATION)
    .withMigration(V52_TO_V51_MIGRATION)
    .withMigration(V51_TO_V50_MIGRATION)
    .withMigration(V50_TO_V49_MIGRATION)
    .withMigration(V49_TO_V48_MIGRATION)
    .withMigration(V48_TO_V47_MIGRATION)
    .withMigration(V47_TO_V46_MIGRATION)
    .withMigration(V46_TO_V45_MIGRATION)
    .withMigration(V45_TO_V44_MIGRATION)
    .withMigration(V44_TO_V43_MIGRATION)
    .withMigration(V43_TO_V42_MIGRATION)
    .withMigration(V42_TO_V41_MIGRATION)
    .withMigration(V41_TO_V40_MIGRATION)
    .withMigration(V40_TO_V39_MIGRATION)
    .withMigration(V39_TO_V38_MIGRATION)
    .withMigration(V38_TO_V37_MIGRATION)
    .withMigration(V37_TO_V36_MIGRATION)
    .withMigration(V36_TO_V35_MIGRATION)
    .withMigration(V35_TO_V34_MIGRATION)
    .withMigration(V34_TO_V33_MIGRATION)
    .withMigration(V33_TO_V32_MIGRATION)
    .withMigration(V32_TO_V31_MIGRATION)
    .withMigration(V31_TO_V30_MIGRATION)
    .withMigration(V30_TO_V29_MIGRATION)
    .withMigration(V29_TO_V28_MIGRATION)
    .withMigration(V28_TO_V27_MIGRATION)
    .withMigration(V27_TO_V26_MIGRATION)
    .withMigration(V26_TO_V25_MIGRATION)
    .withMigration(V25_TO_V24_MIGRATION)
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
