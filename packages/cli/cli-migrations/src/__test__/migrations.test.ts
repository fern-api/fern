import { readdir } from "fs/promises";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { isVersionAhead } from "@fern-api/semver-utils";

import { ALL_MIGRATIONS } from "../migrations";
import { Migration } from "../types/Migration";
import { VersionMigrations } from "../types/VersionMigrations";

const MIGRATIONS_DIRECTORY = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("../migrations"));

describe("migrations", () => {
    it("each version export all its migrations", async () => {
        const versions = (await readdir(MIGRATIONS_DIRECTORY, { withFileTypes: true }))
            .filter((item) => item.isDirectory())
            .map((item) => item.name);

        for (const version of versions) {
            const pathToVersionDirectory = join(MIGRATIONS_DIRECTORY, RelativeFilePath.of(version));

            const allMigrationsPromises = (await readdir(pathToVersionDirectory, { withFileTypes: true }))
                .filter((item) => item.isDirectory())
                .map(async (item) => {
                    const fullPath = join(pathToVersionDirectory, RelativeFilePath.of(item.name));
                    const imported = await import(fullPath);
                    return imported.default as Migration;
                });
            const allMigrations: Migration[] = await Promise.all(allMigrationsPromises);

            const exportedMigrations = (await import(pathToVersionDirectory)).default as VersionMigrations;

            expect(exportedMigrations.version).toBe(version);
            expect(allMigrations.length).toEqual(exportedMigrations.migrations.length);
            for (const migration of allMigrations) {
                expect(exportedMigrations.migrations).toContainEqual(
                    expect.objectContaining({
                        name: migration.name
                    })
                );
            }
        }
    });

    it("all migrations are registered", async () => {
        const allMigrationsPromises = (await readdir(MIGRATIONS_DIRECTORY, { withFileTypes: true }))
            .filter((item) => item.isDirectory())
            .map(async (item) => {
                const fullPath = join(MIGRATIONS_DIRECTORY, RelativeFilePath.of(item.name));
                const imported = await import(fullPath);
                return imported.default as VersionMigrations;
            });
        const allMigrations: VersionMigrations[] = await Promise.all(allMigrationsPromises);

        const registeredMigrations = ALL_MIGRATIONS;

        expect(allMigrations.length).toEqual(registeredMigrations.length);
        for (const migration of allMigrations) {
            expect(registeredMigrations).toContainEqual(
                expect.objectContaining({
                    version: migration.version
                })
            );
        }
    });

    it("migrations are in semver order", () => {
        for (const [index, migration] of ALL_MIGRATIONS.entries()) {
            const nextMigration = ALL_MIGRATIONS[index + 1];
            if (nextMigration != null) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(isVersionAhead(nextMigration.version, migration.version)).toBe(true);
            }
        }
    });
});
