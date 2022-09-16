import { isVersionAhead } from "@fern-api/semver-utils";
import { VersionMigrations } from "../types/VersionMigrations";
import { ALL_MIGRATIONS } from "./all";

export function getMigrationsToRun({
    fromVersion,
    toVersion,
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
 * returns undefined if no migrations are >= the provided version.
 */
function getIndexOfFirstMigrationGreaterThanOrEqualTo(version: string): number | undefined {
    const index = ALL_MIGRATIONS.findIndex(
        ({ version: versionOfMigration }) =>
            versionOfMigration === version || isVersionAhead(versionOfMigration, version)
    );
    if (index === -1) {
        return undefined;
    }
    return index;
}
