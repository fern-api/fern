import { GeneratorName } from "@fern-api/configuration-loader";

import { IrMigrationContext } from "../IrMigrationContext";

export type GeneratorVersion = string | GeneratorWasNeverUpdatedToConsumeNewIR | GeneratorWasNotCreatedYet;

export const GeneratorWasNeverUpdatedToConsumeNewIR = Symbol();
export type GeneratorWasNeverUpdatedToConsumeNewIR = typeof GeneratorWasNeverUpdatedToConsumeNewIR;

export const GeneratorWasNotCreatedYet = Symbol();
export type GeneratorWasNotCreatedYet = typeof GeneratorWasNotCreatedYet;

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
     * firstGeneratorVersionToConsumeNewIR, then this migration is needed.
     *
     * if the targeted generator's version is GeneratorWasNeverUpdatedToConsumeNewIR, then this
     * migration is needed.
     *
     * if the targeted generator's version is GeneratorWasNotCreatedYet,
     * we throw if this migration is encountered for this generator.
     */
    firstGeneratorVersionToConsumeNewIR: Record<GeneratorName, GeneratorVersion>;

    jsonifyEarlierVersion: (ir: EarlierVersion) => unknown | Promise<unknown>;
}
