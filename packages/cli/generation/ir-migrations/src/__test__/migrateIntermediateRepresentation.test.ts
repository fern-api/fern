import { isVersionAhead } from "@fern-api/semver-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import * as V1 from "@fern-fern/ir-v1-model";
import { readdir } from "fs/promises";
import path from "path";
import { getIntermediateRepresentationMigrator } from "../IntermediateRepresentationMigrator";
import { migrateIntermediateRepresentation } from "../migrateIntermediateRepresentation";
import { GeneratorName } from "../types/GeneratorName";
import { AlwaysRunMigration } from "../types/IrMigration";
import { MOCK_IR_V2 } from "./mocks/irV2";

describe("migrateIntermediateRepresentation", () => {
    it("all migrations are registered", async () => {
        const numberOfMigrations = (
            await readdir(path.join(__dirname, "../migrations"), { withFileTypes: true })
        ).filter((item) => item.isDirectory()).length;
        const numberOfRegisteredMigrations = getIntermediateRepresentationMigrator().migrations.length;
        expect(numberOfMigrations).toEqual(numberOfRegisteredMigrations);
    });

    describe("migrations are in order", () => {
        const migrations = getIntermediateRepresentationMigrator().migrations;
        for (const generatorName of Object.values(GeneratorName)) {
            // eslint-disable-next-line jest/valid-title
            it(generatorName, () => {
                const versions = migrations.map((migration) => migration.minGeneratorVersionsToExclude[generatorName]);
                const expectedVersions = versions.sort((a, b) => {
                    // a null version signifies this migration should never be
                    // run for this generator, so it should be at the end
                    if (a == null) {
                        return 1;
                    }
                    if (b == null) {
                        return -1;
                    }

                    // a LatestGeneratorVersion version signifies this migration
                    // should always be run for this generator, so it should be
                    // at the start
                    if (a === AlwaysRunMigration) {
                        return -1;
                    }
                    if (b === AlwaysRunMigration) {
                        return 1;
                    }

                    // in general, versions should be sorted from latest to earlier
                    return isVersionAhead(a, b) ? -1 : 1;
                });

                expect(versions).toEqual(expectedVersions);
            });
        }
    });

    it("does not run migration if generator version is equal to migration's 'minVersiontoExclude'", () => {
        const migrated = migrateIntermediateRepresentation({
            generatorName: "fernapi/fern-typescript-sdk",
            generatorVersion: "0.0.245",
            intermediateRepresentation: MOCK_IR_V2 as unknown as IntermediateRepresentation,
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toBeUndefined();
    });

    it("runs migration if generator (dev) version is less than migration's 'minVersiontoExclude'", () => {
        const migrated = migrateIntermediateRepresentation({
            generatorName: "fernapi/fern-typescript-sdk",
            generatorVersion: "0.0.244-1-ga1ce47f",
            intermediateRepresentation: MOCK_IR_V2 as unknown as IntermediateRepresentation,
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError",
        });
    });

    it("runs migration if generator (release) version is less than migration's 'minVersiontoExclude'", () => {
        const migrated = migrateIntermediateRepresentation({
            generatorName: "fernapi/fern-typescript-sdk",
            generatorVersion: "0.0.244",
            intermediateRepresentation: MOCK_IR_V2 as unknown as IntermediateRepresentation,
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError",
        });
    });

    it("does not run migration if generator (dev) version is greater than migration's 'minVersiontoExclude'", () => {
        const migrated = migrateIntermediateRepresentation({
            generatorName: "fernapi/fern-typescript-sdk",
            generatorVersion: "0.0.245-1-ga1ce47f",
            intermediateRepresentation: MOCK_IR_V2 as unknown as IntermediateRepresentation,
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toBeUndefined();
    });

    it("does not run migration if generator (release) version is greater than migration's 'minVersiontoExclude'", () => {
        const migrated = migrateIntermediateRepresentation({
            generatorName: "fernapi/fern-typescript-sdk",
            generatorVersion: "0.0.246",
            intermediateRepresentation: MOCK_IR_V2 as unknown as IntermediateRepresentation,
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toBeUndefined();
    });
});
