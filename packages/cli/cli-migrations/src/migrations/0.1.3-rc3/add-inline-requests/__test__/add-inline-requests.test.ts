import { cp, readFile } from "fs/promises";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { migration } from "../migration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("add-inline-requests", () => {
    it("simple", async () => {
        const fixturePath = join(FIXTURES_PATH, RelativeFilePath.of("simple"));
        const tmpDir = await tmp.dir();

        await cp(fixturePath, tmpDir.path, { recursive: true });
        process.chdir(tmpDir.path);

        await migration.run({
            context: createMockTaskContext()
        });

        const newBlogYml = (
            await readFile(join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("fern/api/definition/blog.yml")))
        ).toString();

        expect(newBlogYml).toMatchSnapshot();
    });
});
