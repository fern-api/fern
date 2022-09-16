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
        getIndexOfFirstMigrationToNotRun(fromVersion),
        getIndexOfFirstMigrationToNotRun(toVersion)
    );
}

/**
 * returns the index of the first migration that _shouldn't_ be run for this version.
 * example:
 *   migrations are [0.0.188, 0.0.191, 0.0.200]
 *   getIndexOfFirstMigrationToNotRun("0.0.188") -> 0, since we don't run any migrations.
 *   getIndexOfFirstMigrationToNotRun("0.0.189") -> 1, since we run just the first migration.
 *   getIndexOfFirstMigrationToNotRun("0.0.191") -> 1, since we run just the first migration.
 *   getIndexOfFirstMigrationToNotRun("0.0.192") -> 2, since we run the first two migrations.
 *   getIndexOfFirstMigrationToNotRun("0.0.200") -> 2, since we run the first two migrations.
 *   getIndexOfFirstMigrationToNotRun("0.0.201") -> 3, since we run the all three migrations.
 */
function getIndexOfFirstMigrationToNotRun(version: string): number {
    let index;
    for (index = 0; index < ALL_MIGRATIONS.length; index++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { version: versionOfMigration } = ALL_MIGRATIONS[index]!;

        if (version === versionOfMigration || isVersionAhead(versionOfMigration, version)) {
            return index;
        }
    }
    return index;
}
