import { isVersionAhead } from "@fern-api/semver-utils";

import { VersionMigrations } from "../types/VersionMigrations";
import { ALL_MIGRATIONS } from "./all";

export function getMigrationsToRun({
    fromVersion,
    toVersion
}: {
    fromVersion: string;
    toVersion: string;
}): VersionMigrations[] {
    const startIdx = getIndexOfFirstMigrationGreaterThanOrEqualTo(fromVersion);
    const endIdx = getIndexOfFirstMigrationGreaterThanOrEqualTo(toVersion);

    const adjustedEndIdx = ALL_MIGRATIONS[endIdx]?.version === toVersion ? endIdx + 1 : endIdx;

    return ALL_MIGRATIONS.slice(startIdx, adjustedEndIdx);
}

/**
 * returns the index of the first migration that is >= the provided version.
 * returns ALL_MIGRATIONS.length if no migrations are >= the provided version.
 */
function getIndexOfFirstMigrationGreaterThanOrEqualTo(version: string): number {
    let index;
    for (index = 0; index < ALL_MIGRATIONS.length; index++) {
        // biome-ignore lint/style/noNonNullAssertion: allow
        const versionOfMigration = ALL_MIGRATIONS[index]!.version;
        if (versionOfMigration === version || isVersionAhead(versionOfMigration, version)) {
            break;
        }
    }
    return index;
}
