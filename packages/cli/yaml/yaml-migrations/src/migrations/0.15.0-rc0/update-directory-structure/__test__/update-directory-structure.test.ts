import { AbsoluteFilePath, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { cp } from "fs/promises";
import tmp from "tmp-promise";
import { migration } from "../migration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const FIXTURES = ["single-api"].map(RelativeFilePath.of);

describe("update-directory-structure", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(fixture, async () => {
            const pathToFixture = join(FIXTURES_PATH, fixture);
            const tmpDir = await tmp.dir();

            await cp(pathToFixture, tmpDir.path, { recursive: true });
            process.chdir(tmpDir.path);

            await migration.run({
                context: createMockTaskContext(),
            });

            expect(await getDirectoryContents(pathToFixture)).toMatchSnapshot();
        });
    }
});
