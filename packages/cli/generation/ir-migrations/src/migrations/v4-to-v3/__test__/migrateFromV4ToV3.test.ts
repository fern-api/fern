import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { IrVersions } from "../../../ir-versions";
import { V4_TO_V3_MIGRATION } from "../migrateFromV4ToV3";

const runMigration = createMigrationTester(V4_TO_V3_MIGRATION);

describe("migrateFromV4ToV3", () => {
    it("adds discriminantValue to errors", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });

        expect(migrated.ir.types[0]?.examples?.[0]).toEqual(
            IrVersions.V3.types.ExampleType.object({
                properties: [
                    {
                        wireKey: "title",
                        value: IrVersions.V3.types.ExampleTypeReference.primitive(
                            IrVersions.V3.types.ExamplePrimitive.string("hello")
                        ),
                        originalTypeDeclaration: expect.anything()
                    }
                ]
            })
        );
    });
});
