import { WORKSPACE_DEFINITION_FILENAME } from "@fern-api/compiler-commons";
import execa from "execa";
import { mkdir, readFile, rm } from "fs/promises";
import path from "path";

const GENERATED_DIR = path.join(__dirname, "generated");
const GENERATED_API_DIR = path.join(GENERATED_DIR, "api");

describe("fern add tests", () => {
    it("fern add", async () => {
        await rm(GENERATED_DIR, { force: true, recursive: true });
        await mkdir(GENERATED_DIR);
        await init();
        await add("java");
        await add("typescript");
        await add("postman");
        const fileContents = await readFile(path.join(GENERATED_API_DIR, WORKSPACE_DEFINITION_FILENAME));
        expect(fileContents.toString()).toMatchSnapshot();
    }, 10_000);
});

async function init() {
    const init = execa("node", [path.join(process.cwd(), "../cli/cli"), "init"], {
        env: {
            NODE_ENV: "development",
        },
        cwd: GENERATED_DIR,
    });
    init.stdout?.pipe(process.stdout);
    init.stderr?.pipe(process.stderr);
    await init;
}

async function add(generator: string) {
    await execa("node", [path.join(process.cwd(), "../cli/cli"), "add", generator], {
        env: {
            NODE_ENV: "development",
        },
        cwd: GENERATED_DIR,
    });
}
