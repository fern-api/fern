import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getIntermediateRepresentationMigrator } from "../../../IntermediateRepresentationMigrator";
import { IrVersions } from "../../../ir-versions";
import { getIrForApi } from "../../../__test__/utils/getIrForApi";
import { V4_TO_V3_MIGRATION } from "../migrateFromV4ToV3";

describe("migrateFromV4ToV3", () => {
    it("adds discriminantValue to errors", async () => {
        const migrated = getIntermediateRepresentationMigrator().migrateThroughMigration({
            migration: V4_TO_V3_MIGRATION,
            intermediateRepresentation: await getIrForApi(join(AbsoluteFilePath.of(__dirname), "./fixtures/simple")),
        });

        expect(migrated.types[0]?.examples?.[0]).toEqual(
            IrVersions.V3.types.ExampleType.object({
                properties: [
                    {
                        wireKey: "title",
                        value: IrVersions.V3.types.ExampleTypeReference.primitive(
                            IrVersions.V3.types.ExamplePrimitive.string("hello")
                        ),
                        originalTypeDeclaration: expect.anything(),
                    },
                ],
            })
        );
    });
});
