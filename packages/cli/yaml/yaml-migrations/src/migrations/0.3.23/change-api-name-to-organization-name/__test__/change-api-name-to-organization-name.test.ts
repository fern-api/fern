import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { cp, readFile } from "fs/promises";
import yaml from "js-yaml";
import tmp from "tmp-promise";
import { migration } from "../migration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), "fixtures");

describe("change-api-name-to-organization-name", () => {
    it('changes to org name when api name is "api"', async () => {
        const fixturePath = join(FIXTURES_PATH, "api-name-is-api");
        const tmpDir = await tmp.dir();

        await cp(fixturePath, tmpDir.path, { recursive: true });
        process.chdir(tmpDir.path);

        await migration.run({
            context: createMockTaskContext(),
        });

        const newApiYml = (
            await readFile(join(AbsoluteFilePath.of(tmpDir.path), "fern/api/definition/api.yml"))
        ).toString();

        const parsed = yaml.load(newApiYml);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((parsed as any).name).toBe("fern");
    });

    it('skips when api name is not "api"', async () => {
        const fixturePath = join(FIXTURES_PATH, "api-name-is-not-api");
        const tmpDir = await tmp.dir();

        await cp(fixturePath, tmpDir.path, { recursive: true });
        process.chdir(tmpDir.path);

        const originalApiYml = (await readFile(join(fixturePath, "fern/api/definition/api.yml"))).toString();

        await migration.run({
            context: createMockTaskContext(),
        });

        const newApiYml = (
            await readFile(join(AbsoluteFilePath.of(tmpDir.path), "fern/api/definition/api.yml"))
        ).toString();

        expect(newApiYml).toEqual(originalApiYml);
    });
});
