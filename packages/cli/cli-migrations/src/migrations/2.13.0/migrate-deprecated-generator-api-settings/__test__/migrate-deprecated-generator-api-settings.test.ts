import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { cp, readFile } from "fs/promises";
import tmp from "tmp-promise";

import { migration } from "../migration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const SINGLE_WORKSPACE_FIXTURES = [
    "use-title-only",
    "unions-v1-only",
    "both-deprecated-keys",
    "no-deprecated-keys",
    "new-keys-already-present"
].map(RelativeFilePath.of);

describe("migrate-deprecated-generator-api-settings", () => {
    describe("single-workspace", () => {
        for (const fixture of SINGLE_WORKSPACE_FIXTURES) {
            // eslint-disable-next-line jest/valid-title
            it(fixture, async () => {
                const pathToFixture = join(FIXTURES_PATH, fixture);
                const tmpDir = await tmp.dir();

                await cp(pathToFixture, tmpDir.path, { recursive: true });
                process.chdir(tmpDir.path);

                await migration.run({
                    context: createMockTaskContext()
                });

                console.log(`Migrated fixture ${fixture} at path ${tmpDir.path}`);
                const content = await readFile(
                    join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("./fern/generators.yml")),
                    "utf-8"
                );
                await expect(content).toMatchFileSnapshot(`./__snapshots__/single-workspace/${fixture}/generators.yml`);
            });
        }
    });
});
