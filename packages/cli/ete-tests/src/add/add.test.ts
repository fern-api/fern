import { AbsoluteFilePath, getDirectoryContents, join, RelativeFilePath } from "@fern-api/core-utils";
import { mkdir, rm } from "fs/promises";
import { init } from "../init/init";
import { runFernCli } from "../utils/runFernCli";

const GENERATED_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("generated"));

it("fern add", async () => {
    await rm(GENERATED_DIR, { force: true, recursive: true });
    await mkdir(GENERATED_DIR);
    await init(GENERATED_DIR);
    await add("java");
    await add("typescript");
    await add("postman");
    await add("openapi");

    expect(await getDirectoryContents(GENERATED_DIR)).toMatchSnapshot();
}, 60_000);

async function add(generator: string) {
    await runFernCli(["add", generator], {
        cwd: GENERATED_DIR,
    });
}
