import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { createMigrationTester } from "../../../__test__/utils/createMigrationTester";
import { V15_TO_V14_MIGRATION } from "../migrateFromV15ToV14";

const runMigration = createMigrationTester(V15_TO_V14_MIGRATION);

describe("migrateFromV15ToV14", () => {
    it("migrates header", async () => {
        const migrated = await runMigration({
            pathToFixture: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("./fixtures/simple"))
        });

        const typeDeclaration = Object.values(migrated.ir.types)[0];
        if (typeDeclaration?.shape._type !== "object") {
            throw new Error("First type is not an object");
        }
        if (typeDeclaration.shape.properties[0]?.valueType._type !== "primitive") {
            throw new Error("First property is not a primitive");
        }
        expect(typeDeclaration.shape.properties[0]?.valueType.primitive).toBe("STRING");
    });
});
