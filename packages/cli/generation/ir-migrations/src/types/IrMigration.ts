import { GeneratorName } from "./GeneratorName";

export type GeneratorVersion = string | typeof AlwaysRunMigration;

export const AlwaysRunMigration = Symbol();

export interface IrMigration<NextVersion, PreviousVersion> {
    migrateBackwards: (next: NextVersion) => PreviousVersion;

    /**
     * if the targeted generator's version is less than or equal to its value in
     * requiredForGeneratorVersions, then this migration is needed.
     *
     * if the targeted generator's version is greater than its value in this
     * map, or the value in this map is `undefined`, then this migration is
     * needed.
     *
     * if the targeted generator's version is AlwaysRunMigration, then this
     * migration is needed
     */
    requiredForGeneratorVersions: Record<GeneratorName, GeneratorVersion | undefined>;
}
