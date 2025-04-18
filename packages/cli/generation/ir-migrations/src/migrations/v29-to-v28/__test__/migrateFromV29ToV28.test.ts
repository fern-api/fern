import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V29_TO_V28_MIGRATION } from "../migrateFromV29ToV28";

const runMigration = createMigrationTester(V29_TO_V28_MIGRATION);

const expectedReferenceTypes = [
    {
        fernFilepath: {
            allParts: [
                {
                    camelCase: {
                        safeName: "types",
                        unsafeName: "types"
                    },
                    originalName: "types",
                    pascalCase: {
                        safeName: "Types",
                        unsafeName: "Types"
                    },
                    screamingSnakeCase: {
                        safeName: "TYPES",
                        unsafeName: "TYPES"
                    },
                    snakeCase: {
                        safeName: "types",
                        unsafeName: "types"
                    }
                }
            ],
            file: {
                camelCase: {
                    safeName: "types",
                    unsafeName: "types"
                },
                originalName: "types",
                pascalCase: {
                    safeName: "Types",
                    unsafeName: "Types"
                },
                screamingSnakeCase: {
                    safeName: "TYPES",
                    unsafeName: "TYPES"
                },
                snakeCase: {
                    safeName: "types",
                    unsafeName: "types"
                }
            },
            packagePath: []
        },
        name: {
            camelCase: {
                safeName: "wheel",
                unsafeName: "wheel"
            },
            originalName: "Wheel",
            pascalCase: {
                safeName: "Wheel",
                unsafeName: "Wheel"
            },
            screamingSnakeCase: {
                safeName: "WHEEL",
                unsafeName: "WHEEL"
            },
            snakeCase: {
                safeName: "wheel",
                unsafeName: "wheel"
            }
        },
        typeId: "type_types:Wheel"
    }
];

describe("migrateFromV29ToV28", () => {
    it("snapshot", async () => {
        const pathToFixture = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"));
        const migrated = await runMigration({
            pathToFixture
        });
        expect(migrated.ir.types["type_types:Car"]?.referencedTypes).toEqual(expectedReferenceTypes);
        expect(await migrated.jsonify()).toMatchSnapshot();
    });
});
