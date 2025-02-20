import { cp, readFile } from "fs/promises";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { migration } from "../migration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const FIXTURES = ["root-settings", "openapi-single", "asyncapi-single", "api-array", "api-namespaces"].map(
    RelativeFilePath.of
);

describe("use-generators-yml-specs", () => {
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
            const content = await readFile(
                join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("./fern/generators.yml")),
                "utf-8"
            );
            await expect(content).toMatchFileSnapshot(`./__snapshots__/${fixture}/generators.yml`);
        });
    }
});
