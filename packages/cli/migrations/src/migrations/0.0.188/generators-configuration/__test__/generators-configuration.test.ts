import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { loadProject } from "@fern-api/project-loader";
import { createMockTaskContext, TASK_FAILURE } from "@fern-api/task-context";
import { cp, readFile } from "fs/promises";
import tmp from "tmp-promise";
import { GeneratorsConfigurationMigration } from "../generators-configuration";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("generators-configuration", () => {
    it("simple", async () => {
        const fixturePath = join(FIXTURES_PATH, RelativeFilePath.of("simple"));
        const tmpDir = await tmp.dir();

        await cp(fixturePath, tmpDir.path, { recursive: true });
        process.chdir(tmpDir.path);

        const project = await loadProject({
            cliName: "fern",
            commandLineWorkspace: undefined,
            defaultToAllWorkspaces: true,
            context: createMockTaskContext(),
        });

        if (project === TASK_FAILURE) {
            throw new Error("Failed to parse project.");
        }

        await GeneratorsConfigurationMigration.run({
            context: createMockTaskContext(),
            project,
        });

        const newGeneratorsConfiguration = (
            await readFile(join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("fern/api/generators.yml")))
        ).toString();

        expect(newGeneratorsConfiguration).toMatchSnapshot();
    });
});
