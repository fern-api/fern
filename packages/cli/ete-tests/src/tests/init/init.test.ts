import { AbsoluteFilePath, getDirectoryContents, join, RelativeFilePath } from "@fern-api/core-utils";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { mkdir, rm } from "fs/promises";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "./init";

const GENERATED_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("generated"));

it("fern init", async () => {
    await rm(GENERATED_DIR, { force: true, recursive: true });
    await mkdir(GENERATED_DIR);

    await init(GENERATED_DIR);

    await runFernCli(["check"], {
        cwd: GENERATED_DIR,
    });

    expect(await getDirectoryContents(join(GENERATED_DIR, RelativeFilePath.of(FERN_DIRECTORY)))).toMatchSnapshot();
}, 60_000);
