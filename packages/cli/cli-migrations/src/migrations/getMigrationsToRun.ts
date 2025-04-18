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
    return ALL_MIGRATIONS.slice(
        getIndexOfFirstMigrationGreaterThanOrEqualTo(fromVersion),
        getIndexOfFirstMigrationGreaterThanOrEqualTo(toVersion)
    );
}

/**
 * returns the index of the first migration that is >= the provided version.
 * returns ALL_MIGRATIONS.length if no migrations are >= the provided version.
 */
function getIndexOfFirstMigrationGreaterThanOrEqualTo(version: string): number {
    let index;
    for (index = 0; index < ALL_MIGRATIONS.length; index++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const versionOfMigration = ALL_MIGRATIONS[index]!.version;
        if (versionOfMigration === version || isVersionAhead(versionOfMigration, version)) {
            break;
        }
    }
    return index;
}
