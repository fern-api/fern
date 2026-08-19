import { GeneratorName } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { isVersionAhead } from "@fern-api/semver-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { getIntermediateRepresentationMigrator } from "../IntermediateRepresentationMigrator.js";
import { IrVersions } from "../ir-versions/index.js";
import { migrateIntermediateRepresentationForGenerator } from "../migrateIntermediateRepresentationForGenerator.js";
import {
    GeneratorVersion,
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet
} from "../types/IrMigration.js";
import { getIrForApi } from "./utils/getIrForApi.js";

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
                version: "0.38.0-rc0"
            }
        });
        // Access first error by getting the first object value, not by array index
        const castedMigrated = migrated as IrVersions.V53.ir.IntermediateRepresentation;
        const firstError = castedMigrated?.errors ? Object.values(castedMigrated.errors)[0] : undefined;

        expect(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            firstError?.discriminantValue
        ).toEqual({
            name: {
                camelCase: {
                    safeName: "blogNotFoundError",
                    unsafeName: "blogNotFoundError"
                },
                originalName: "BlogNotFoundError",
                pascalCase: {
                    safeName: "BlogNotFoundError",
                    unsafeName: "BlogNotFoundError"
                },
                screamingSnakeCase: {
                    safeName: "BLOG_NOT_FOUND_ERROR",
                    unsafeName: "BLOG_NOT_FOUND_ERROR"
                },
                snakeCase: {
                    safeName: "blog_not_found_error",
                    unsafeName: "blog_not_found_error"
                }
            },
            wireValue: "BlogNotFoundError"
        });
    });

    it("runs migration if generator (dev) version is less than migration's 'minVersiontoExclude'", async () => {
        const migrated = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.37.0-1-ga1ce47f"
            }
        });

        // Access first error by getting the first object value, not by array index
        const castedMigrated = migrated as IrVersions.V53.ir.IntermediateRepresentation;
        const firstError = castedMigrated?.errors ? Object.values(castedMigrated.errors)[0] : undefined;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect(firstError?.discriminantValue).toEqual({
            name: {
                camelCase: {
                    safeName: "blogNotFoundError",
                    unsafeName: "blogNotFoundError"
                },
                originalName: "BlogNotFoundError",
                pascalCase: {
                    safeName: "BlogNotFoundError",
                    unsafeName: "BlogNotFoundError"
                },
                screamingSnakeCase: {
                    safeName: "BLOG_NOT_FOUND_ERROR",
                    unsafeName: "BLOG_NOT_FOUND_ERROR"
                },
                snakeCase: {
                    safeName: "blog_not_found_error",
                    unsafeName: "blog_not_found_error"
                }
            },
            wireValue: "BlogNotFoundError"
        });
    });

    it("runs migration if generator (release) version is less than migration's 'minVersiontoExclude'", async () => {
        const migrated = await migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.37.0"
            }
        });
        // Access first error by getting the first object value, not by array index
        const castedMigrated = migrated as IrVersions.V53.ir.IntermediateRepresentation;
        const firstError = castedMigrated?.errors ? Object.values(castedMigrated.errors)[0] : undefined;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect(firstError?.discriminantValue).toEqual({
            name: {
                camelCase: {
                    safeName: "blogNotFoundError",
                    unsafeName: "blogNotFoundError"
                },
                originalName: "BlogNotFoundError",
                pascalCase: {
                    safeName: "BlogNotFoundError",
                    unsafeName: "BlogNotFoundError"
                },
                screamingSnakeCase: {
                    safeName: "BLOG_NOT_FOUND_ERROR",
                    unsafeName: "BLOG_NOT_FOUND_ERROR"
                },
                snakeCase: {
                    safeName: "blog_not_found_error",
                    unsafeName: "blog_not_found_error"
                }
            },
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

        // Access first error by getting the first object value, not by array index
        const castedMigrated = migrated as IrVersions.V53.ir.IntermediateRepresentation;
        const firstError = castedMigrated?.errors ? Object.values(castedMigrated.errors)[0] : undefined;

        expect(firstError?.discriminantValue).toEqual({
            name: {
                camelCase: {
                    safeName: "blogNotFoundError",
                    unsafeName: "blogNotFoundError"
                },
                originalName: "BlogNotFoundError",
                pascalCase: {
                    safeName: "BlogNotFoundError",
                    unsafeName: "BlogNotFoundError"
                },
                screamingSnakeCase: {
                    safeName: "BLOG_NOT_FOUND_ERROR",
                    unsafeName: "BLOG_NOT_FOUND_ERROR"
                },
                snakeCase: {
                    safeName: "blog_not_found_error",
                    unsafeName: "blog_not_found_error"
                }
            },
            wireValue: "BlogNotFoundError"
        });
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

        // Access first error by getting the first object value, not by array index
        const castedMigrated = migrated as IrVersions.V53.ir.IntermediateRepresentation;
        const firstError = castedMigrated?.errors ? Object.values(castedMigrated.errors)[0] : undefined;

        expect(firstError?.discriminantValue).toEqual({
            name: {
                camelCase: {
                    safeName: "blogNotFoundError",
                    unsafeName: "blogNotFoundError"
                },
                originalName: "BlogNotFoundError",
                pascalCase: {
                    safeName: "BlogNotFoundError",
                    unsafeName: "BlogNotFoundError"
                },
                screamingSnakeCase: {
                    safeName: "BLOG_NOT_FOUND_ERROR",
                    unsafeName: "BLOG_NOT_FOUND_ERROR"
                },
                snakeCase: {
                    safeName: "blog_not_found_error",
                    unsafeName: "blog_not_found_error"
                }
            },
            wireValue: "BlogNotFoundError"
        });
    });
});

function getIrForSimpleApi(): Promise<IntermediateRepresentation> {
    return getIrForApi(join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple")));
}
