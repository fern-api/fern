import { GeneratorName } from "@fern-api/configuration-loader";
import { IntermediateRepresentation, serialization as IrSerialization } from "@fern-api/ir-sdk";
import { isVersionAhead } from "@fern-api/semver-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { GENERATOR_MINIMUM_VERSIONS, MINIMUM_SUPPORTED_IR_VERSION } from "./generatorVersionMap.js";
import { GeneratorNameAndVersion } from "./IrMigrationContext.js";
import { V54_TO_V53_MIGRATION } from "./migrations/v54-to-v53/migrateFromV54ToV53.js";
import { V55_TO_V54_MIGRATION } from "./migrations/v55-to-v54/migrateFromV55ToV54.js";
import { V56_TO_V55_MIGRATION } from "./migrations/v56-to-v55/migrateFromV56ToV55.js";
import { V57_TO_V56_MIGRATION } from "./migrations/v57-to-v56/migrateFromV57ToV56.js";
import { V58_TO_V57_MIGRATION } from "./migrations/v58-to-v57/migrateFromV58ToV57.js";
import { V59_TO_V58_MIGRATION } from "./migrations/v59-to-v58/migrateFromV59ToV58.js";
import { V60_TO_V59_MIGRATION } from "./migrations/v60-to-v59/migrateFromV60ToV59.js";
import { V61_TO_V60_MIGRATION } from "./migrations/v61-to-v60/migrateFromV61ToV60.js";
import { V62_TO_V61_MIGRATION } from "./migrations/v62-to-v61/migrateFromV62ToV61.js";
import { V63_TO_V62_MIGRATION } from "./migrations/v63-to-v62/migrateFromV63ToV62.js";
import { V65_TO_V63_MIGRATION } from "./migrations/v65-to-v63/migrateFromV65ToV63.js";
import { V66_TO_V65_MIGRATION } from "./migrations/v66-to-v65/migrateFromV66ToV65.js";
import { GeneratorWasNeverUpdatedToConsumeNewIR, GeneratorWasNotCreatedYet, IrMigration } from "./types/IrMigration.js";

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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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

    private getMinimumGeneratorVersion(generatorName: string): string | undefined {
        return GENERATOR_MINIMUM_VERSIONS[generatorName];
    }

    private validateMinimumVersion(targetVersion: string, targetGenerator?: GeneratorNameAndVersion): void {
        const versionNum = parseInt(targetVersion.replace("v", ""), 10);
        const minSupportedVersion = MINIMUM_SUPPORTED_IR_VERSION;

        if (versionNum < minSupportedVersion) {
            if (targetGenerator != null) {
                const minVersion = this.getMinimumGeneratorVersion(targetGenerator.name);
                if (minVersion != null) {
                    throw new CliError({
                        message:
                            `${targetGenerator.name}@${targetGenerator.version} is not compatible with CLI v4.x.x+. ` +
                            `Please upgrade to ${targetGenerator.name}@${minVersion} or later using 'fern generator upgrade --include-major'.`,
                        code: CliError.Code.VersionError
                    });
                }
            }

            throw new CliError({
                message:
                    "This generator version is not compatible with CLI v4.x.x+. " +
                    "Please upgrade your generator using 'fern generator upgrade --include-major'.",
                code: CliError.Code.VersionError
            });
        }
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
        this.validateMinimumVersion(version, targetGenerator);
        let hasEncounteredMigrationYet = false;

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
                hasEncounteredMigrationYet ||= isEncounteringMigration;
                return isEncounteringMigration || !hasEncounteredMigrationYet;
            },
            context,
            targetGenerator
        });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!hasEncounteredMigrationYet) {
            context.failAndThrow(`IR ${version} does not exist`, undefined, { code: CliError.Code.VersionError });
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
            return IrSerialization.IntermediateRepresentation.jsonOrThrow(migrated, {
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
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        migration: IrMigration<any, any>;
        targetGenerator: GeneratorNameAndVersion;
    }): boolean {
        const minVersionToExclude =
            migration.firstGeneratorVersionToConsumeNewIR[targetGenerator.name as GeneratorName];

        if (minVersionToExclude == null) {
            throw new CliError({
                message: `Cannot migrate intermediate representation. Unrecognized generator: ${targetGenerator.name}. If leveraging a custom generator, ensure you are specifying "ir-version" within the generator configuration.`,
                code: CliError.Code.ConfigError
            });
        }

        switch (minVersionToExclude) {
            case GeneratorWasNeverUpdatedToConsumeNewIR:
                return true;
            case GeneratorWasNotCreatedYet:
                throw new CliError({
                    message: `Cannot migrate intermediate representation. Generator was created after intermediate representation ${migration.laterVersion}.`,
                    code: CliError.Code.VersionError
                });
        }

        try {
            return isVersionAhead(minVersionToExclude, targetGenerator.version);
        } catch (error) {
            throw new CliError({
                message: `Failed to compare versions: ${error instanceof Error ? error.message : String(error)}`,
                code: CliError.Code.VersionError
            });
        }
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
    .withMigration(V66_TO_V65_MIGRATION)
    .withMigration(V65_TO_V63_MIGRATION)
    .withMigration(V63_TO_V62_MIGRATION)
    .withMigration(V62_TO_V61_MIGRATION)
    .withMigration(V61_TO_V60_MIGRATION)
    .withMigration(V60_TO_V59_MIGRATION)
    .withMigration(V59_TO_V58_MIGRATION)
    .withMigration(V58_TO_V57_MIGRATION)
    .withMigration(V57_TO_V56_MIGRATION)
    .withMigration(V56_TO_V55_MIGRATION)
    .withMigration(V55_TO_V54_MIGRATION)
    .withMigration(V54_TO_V53_MIGRATION)
    .build();
