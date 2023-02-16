import { getDirectoryContents } from "@fern-api/fs-utils";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

it("fern generate", async () => {
    const pathOfDirectory = await init();

    await runFernCli(["generate", "--local", "--keepDocker"], {
        cwd: pathOfDirectory,
    });

    expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
}, 180_000);
