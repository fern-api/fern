import { GeneratorName } from "@fern-api/generators-configuration";
import { IrMigrationContext } from "../IrMigrationContext";

export type GeneratorVersion = string | AlwaysRunMigration;

export const AlwaysRunMigration = Symbol();
export type AlwaysRunMigration = typeof AlwaysRunMigration;

export interface IrMigration<LaterVersion, EarlierVersion> {
    // the version of IR we're migrating from
    laterVersion: string;
    // the version of IR we're migrating to
    earlierVersion: string;

    migrateBackwards: (next: LaterVersion, context: IrMigrationContext) => EarlierVersion;

    /**
     * if the targeted generator's version is greater than or equal to its value
     * in this map, or the value in this map is `undefined`, then this migration
     * is not needed.
     *
     * if the targeted generator's version is less than its value in
     * minGeneratorVersionsToExclude, then this migration is needed.
     *
     * if the targeted generator's version is AlwaysRunMigration, then this
     * migration is needed.
     */
    minGeneratorVersionsToExclude: Record<GeneratorName, GeneratorVersion | undefined>;
}
