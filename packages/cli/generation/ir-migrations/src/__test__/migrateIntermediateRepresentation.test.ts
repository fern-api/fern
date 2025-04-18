import { GeneratorName } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { isVersionAhead } from "@fern-api/semver-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { getIntermediateRepresentationMigrator } from "../IntermediateRepresentationMigrator";
import { IrVersions } from "../ir-versions";
import { migrateIntermediateRepresentationForGenerator } from "../migrateIntermediateRepresentationForGenerator";
import {
    GeneratorVersion,
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet
} from "../types/IrMigration";
import { getIrForApi } from "./utils/getIrForApi";

describe("migrateIntermediateRepresentation", () => {
    describe("migrations are in order", () => {
        const migrations = getIntermediateRepresentationMigrator().migrations;
        for (const generatorName of Object.values(GeneratorName)) {
            // eslint-disable-next-line jest/valid-title
            it(generatorName, () => {
                const versions: Exclude<GeneratorVersion, GeneratorWasNeverUpdatedToConsumeNewIR>[] = migrations
                    .map((migration) => migration.firstGeneratorVersionToConsumeNewIR[generatorName])
                    .filter(
                        (version): version is Exclude<typeof version, GeneratorWasNeverUpdatedToConsumeNewIR> =>
                            version !== GeneratorWasNeverUpdatedToConsumeNewIR
                    );
                const expectedVersions = [...versions].sort((a, b) => {
                    if (a === b) {
                        return 0;
                    }

                    // GeneratorWasNotCreatedYet's should be last
                    if (a === GeneratorWasNotCreatedYet) {
                        return 1;
                    }
                    if (b === GeneratorWasNotCreatedYet) {
                        return -1;
                    }

                    return isVersionAhead(a, b) ? -1 : 1;
                });

                expect(versions).toEqual(expectedVersions);
            });
        }
    });

    it("does not run migration if generator version is equal to migration's 'minVersiontoExclude'", async () => {
        const migrated = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.246"
            }
        });
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (migrated as IrVersions.V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue
        ).toBeUndefined();
    });

    it("runs migration if generator (dev) version is less than migration's 'minVersiontoExclude'", async () => {
        const migrated = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.245-1-ga1ce47f"
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError"
        });
    });

    it("runs migration if generator (release) version is less than migration's 'minVersiontoExclude'", async () => {
        const migrated = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.245"
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError"
        });
    });

    it("does not run migration if generator (dev) version is greater than migration's 'minVersiontoExclude'", async () => {
        const migrated = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.246-1-ga1ce47f"
            }
        });

        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation).errors[0]?.discriminantValue).toBeUndefined();
    });

    it("does not run migration if generator (release) version is greater than migration's 'minVersiontoExclude'", async () => {
        const migrated = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.247"
            }
        });

        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation).errors[0]?.discriminantValue).toBeUndefined();
    });
});

function getIrForSimpleApi(): Promise<IntermediateRepresentation> {
    return getIrForApi(join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple")));
}
