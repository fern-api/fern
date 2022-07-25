import { WORKSPACE_DEFINITION_FILENAME } from "@fern-api/commons";
import { mkdir, readFile, rm } from "fs/promises";
import path from "path";
import { runFernCli } from "../utils/runFernCli";

const GENERATED_DIR = path.join(__dirname, "generated");
const GENERATED_API_DIR = path.join(GENERATED_DIR, "api");

it("fern add", async () => {
    await rm(GENERATED_DIR, { force: true, recursive: true });
    await mkdir(GENERATED_DIR);
    await init();
    await add("java");
    await add("typescript");
    await add("postman");
    const fileContents = await readFile(path.join(GENERATED_API_DIR, WORKSPACE_DEFINITION_FILENAME));
    expect(fileContents.toString()).toMatchSnapshot();
}, 60_000);

async function init() {
    await runFernCli(["init", "--organization", "fern"], {
        cwd: GENERATED_DIR,
    });
}

async function add(generator: string) {
    await runFernCli(["add", generator], {
        cwd: GENERATED_DIR,
    });
}
