import { PROJECT_CONFIG_FILENAME, WORKSPACE_DEFINITION_FILENAME } from "@fern-api/commons";
import execa from "execa";
import { mkdir, readFile, rm } from "fs/promises";
import path from "path";

const GENERATED_DIR = path.join(__dirname, "generated");
const GENERATED_API_DIR = path.join(GENERATED_DIR, "api");

describe("fern init tests", () => {
    it("fern init", async () => {
        await rm(GENERATED_DIR, { force: true, recursive: true });
        await mkdir(GENERATED_DIR);
        const cmd = execa("node", [path.join(process.cwd(), "../cli/cli"), "init"], {
            env: {
                NODE_ENV: "development",
            },
            cwd: GENERATED_DIR,
        });
        cmd.stdout?.pipe(process.stdout);
        cmd.stderr?.pipe(process.stderr);
        await cmd;
        expect(await getFileContentsAsString(path.join(GENERATED_DIR, PROJECT_CONFIG_FILENAME))).toMatchSnapshot();
        expect(
            await getFileContentsAsString(path.join(GENERATED_API_DIR, WORKSPACE_DEFINITION_FILENAME))
        ).toMatchSnapshot();
        expect(await getFileContentsAsString(path.join(GENERATED_API_DIR, "src", "blog.yml"))).toMatchSnapshot();
    }, 10_000);
});

async function getFileContentsAsString(filepath: string) {
    const fileContents = await readFile(filepath);
    return fileContents.toString();
}
