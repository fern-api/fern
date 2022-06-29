import { PROJECT_CONFIG_FILENAME, WORKSPACE_DEFINITION_FILENAME } from "@fern-api/commons";
import execa from "execa";
import { mkdir, readFile, rm } from "fs/promises";
import path from "path";

const GENERATED_DIR = path.join(__dirname, "generated");
const GENERATED_API_DIR = path.join(GENERATED_DIR, "api");

it("fern init", async () => {
    await rm(GENERATED_DIR, { force: true, recursive: true });
    await mkdir(GENERATED_DIR);
    const cmd = execa(
        "node",
        [path.join(__dirname, "../../../../cli/webpack/dist/bundle.js"), "init", "--organization", "fern"],
        {
            env: {
                NODE_ENV: "development",
            },
            cwd: GENERATED_DIR,
        }
    );
    cmd.stdout?.pipe(process.stdout);
    cmd.stderr?.pipe(process.stderr);
    await cmd;
    expect(await getFileContentsAsString(path.join(GENERATED_DIR, PROJECT_CONFIG_FILENAME))).toMatchSnapshot();
    expect(
        await getFileContentsAsString(path.join(GENERATED_API_DIR, WORKSPACE_DEFINITION_FILENAME))
    ).toMatchSnapshot();
    expect(await getFileContentsAsString(path.join(GENERATED_API_DIR, "src", "api.yml"))).toMatchSnapshot();
}, 60_000);

async function getFileContentsAsString(filepath: string) {
    const fileContents = await readFile(filepath);
    return fileContents.toString();
}
