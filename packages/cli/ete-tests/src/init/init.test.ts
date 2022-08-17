import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { PROJECT_CONFIG_FILENAME } from "@fern-api/project-configuration";
import { WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { mkdir, readFile, rm } from "fs/promises";
import { runFernCli } from "../utils/runFernCli";

const GENERATED_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("generated"));
const GENERATED_API_DIR = join(GENERATED_DIR, RelativeFilePath.of("api"));

it("fern init", async () => {
    await rm(GENERATED_DIR, { force: true, recursive: true });
    await mkdir(GENERATED_DIR);

    await runFernCli(["init", "--organization", "fern"], {
        cwd: GENERATED_DIR,
    });

    await runFernCli(["check"], {
        cwd: GENERATED_DIR,
    });

    expect(
        await getFileContentsAsString(join(GENERATED_DIR, RelativeFilePath.of(PROJECT_CONFIG_FILENAME)))
    ).toMatchSnapshot();
    expect(
        await getFileContentsAsString(join(GENERATED_API_DIR, RelativeFilePath.of(WORKSPACE_CONFIGURATION_FILENAME)))
    ).toMatchSnapshot();
    expect(
        await getFileContentsAsString(
            join(GENERATED_API_DIR, RelativeFilePath.of("src"), RelativeFilePath.of("api.yml"))
        )
    ).toMatchSnapshot();
}, 60_000);

async function getFileContentsAsString(filepath: AbsoluteFilePath) {
    const fileContents = await readFile(filepath);
    return fileContents.toString();
}
