import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getIntermediateRepresentationMigrator } from "../../../IntermediateRepresentationMigrator";
import { getIrForApi } from "../../../__test__/utils/getIrForApi";
import { V5_TO_V4_MIGRATION } from "../migrateFromV5ToV4";

describe("migrateFromV5ToV4", () => {
    it("correctly migrates", async () => {
        const migrated = getIntermediateRepresentationMigrator().migrateThroughMigration({
            migration: V5_TO_V4_MIGRATION,
            intermediateRepresentation: await getIrForApi(join(AbsoluteFilePath.of(__dirname), "./fixtures/simple")),
        });

        expect(migrated).toMatchSnapshot();
    });
});
