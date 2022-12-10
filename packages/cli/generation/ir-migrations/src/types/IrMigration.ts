import { GeneratorName } from "./GeneratorName";

export type GeneratorVersion = string | typeof AlwaysRunMigration;

export const AlwaysRunMigration = Symbol();

export interface IrMigration<NextVersion, PreviousVersion> {
    migrateBackwards: (next: NextVersion) => PreviousVersion;

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
