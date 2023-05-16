import { GeneratorName } from "@fern-api/generators-configuration";
import { IrMigrationContext } from "../IrMigrationContext";

export type GeneratorVersion = string | AlwaysRunMigration | GeneratorDoesNotExistForEitherIrVersion;

export const AlwaysRunMigration = Symbol();
export type AlwaysRunMigration = typeof AlwaysRunMigration;

export const GeneratorDoesNotExistForEitherIrVersion = Symbol();
export type GeneratorDoesNotExistForEitherIrVersion = typeof GeneratorDoesNotExistForEitherIrVersion;

export interface IrMigration<LaterVersion, EarlierVersion> {
    // the version of IR we're migrating from
    laterVersion: string;
    // the version of IR we're migrating to
    earlierVersion: string;

    migrateBackwards: (next: LaterVersion, context: IrMigrationContext) => EarlierVersion;

    /**
     * if the targeted generator's version is greater than or equal to its value
     * in this map.
     *
     * if the targeted generator's version is less than its value in
     * minGeneratorVersionsToExclude, then this migration is needed.
     *
     * if the targeted generator's version is AlwaysRunMigration, then this
     * migration is needed.
     *
     * if the targeted generator's version is GeneratorDoesNotExistForEitherIrVersion,
     * we throw if this migration is encountered for this generator.
     */
    minGeneratorVersionsToExclude: Record<GeneratorName, GeneratorVersion>;
}
