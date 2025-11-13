import { entries } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { cp, readFile } from "fs/promises";
import tmp from "tmp-promise";

import { migration } from "../migration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const SINGLE_WORKSPACE_FIXTURES = [
    "simple-api",
    "already-has-setting",
    "specs-format",
    "no-settings",
    "api-settings-only",
    "api-settings-already-set",
    "exhaustive"
].map(RelativeFilePath.of);

const MULTIPLE_WORKSPACE_FIXTURES: Record<RelativeFilePath, string[]> = {
    [RelativeFilePath.of("multiple-workspaces")]: ["api1", "api2"]
};

describe("add-path-parameter-order-setting", () => {
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

    describe("multiple workspaces", () => {
        for (const [fixture, apis] of entries(MULTIPLE_WORKSPACE_FIXTURES)) {
            it(fixture, async () => {
                const pathToFixture = join(FIXTURES_PATH, fixture);

                const tmpDir = await tmp.dir();

                await cp(pathToFixture, tmpDir.path, { recursive: true });
                process.chdir(tmpDir.path);

                await migration.run({
                    context: createMockTaskContext()
                });

                for (const api of apis) {
                    const content = await readFile(
                        join(
                            AbsoluteFilePath.of(tmpDir.path),
                            RelativeFilePath.of(`./fern/apis/${api}/generators.yml`)
                        ),
                        "utf-8"
                    );
                    await expect(content).toMatchFileSnapshot(
                        `./__snapshots__/multiple-workspaces/${fixture}-${api}/generators.yml`
                    );
                }
            });
        }
    });
});
