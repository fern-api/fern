import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

it("fern generate", async () => {
    const pathOfDirectory = await init();

    await runFernCli(["generate", "--local", "--keepDocker"], {
        cwd: pathOfDirectory,
    });

    expect(await doesPathExist(join(pathOfDirectory, RelativeFilePath.of("generated/typescript")))).toBe(true);
}, 180_000);
