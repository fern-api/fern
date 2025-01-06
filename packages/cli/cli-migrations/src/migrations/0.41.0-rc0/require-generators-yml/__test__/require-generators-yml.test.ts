import { cp } from "fs/promises";
import tmp from "tmp-promise";

import {
    AbsoluteFilePath,
    RelativeFilePath,
    getDirectoryContents,
    getDirectoryContentsForSnapshot,
    join
} from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { migration } from "../migration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const FIXTURES = [
    "multiple-workspaces",
    "single-fern-definition",
    "single-openapi",
    "single-openapi-with-generators-yml"
].map(RelativeFilePath.of);

describe("require-generators-yml", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(fixture, async () => {
            const pathToFixture = join(FIXTURES_PATH, fixture);
            const tmpDir = await tmp.dir();

            await cp(pathToFixture, tmpDir.path, { recursive: true });
            process.chdir(tmpDir.path);

            await migration.run({
                context: createMockTaskContext()
            });

            // eslint-disable-next-line no-console
            console.log(`Migrated fixture ${fixture} at path ${tmpDir.path}`);

            expect(await getDirectoryContentsForSnapshot(AbsoluteFilePath.of(tmpDir.path))).toMatchSnapshot();
        });
    }
});
