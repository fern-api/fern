import { getDirectoryContents, join, RelativeFilePath } from "@fern-api/core-utils";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "./init";

it("fern init", async () => {
    const pathOfDirectory = await init();
    await runFernCli(["check"], {
        cwd: pathOfDirectory,
    });
    expect(await getDirectoryContents(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))).toMatchSnapshot();
}, 60_000);
