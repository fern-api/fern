import { PROJECT_CONFIG_FILENAME } from "@fern-api/project-configuration";
import { WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { mkdir, readFile, rm } from "fs/promises";
import path from "path";
import { runFernCli } from "../utils/runFernCli";

const GENERATED_DIR = path.join(__dirname, "generated");
const GENERATED_API_DIR = path.join(GENERATED_DIR, "api");

it("fern init", async () => {
    await rm(GENERATED_DIR, { force: true, recursive: true });
    await mkdir(GENERATED_DIR);

    await runFernCli(["init", "--organization", "fern"], {
        cwd: GENERATED_DIR,
    });

    expect(await getFileContentsAsString(path.join(GENERATED_DIR, PROJECT_CONFIG_FILENAME))).toMatchSnapshot();
    expect(
        await getFileContentsAsString(path.join(GENERATED_API_DIR, WORKSPACE_CONFIGURATION_FILENAME))
    ).toMatchSnapshot();
    expect(await getFileContentsAsString(path.join(GENERATED_API_DIR, "src", "api.yml"))).toMatchSnapshot();
}, 60_000);

async function getFileContentsAsString(filepath: string) {
    const fileContents = await readFile(filepath);
    return fileContents.toString();
}
