import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

// eslint-disable-next-line jest/expect-expect, jest/no-disabled-tests
it.skip("fern register", async () => {
    const pathOfDirectory = await init();

    await runFernCli(["register-v2", "--log-level", "debug"], {
        cwd: pathOfDirectory,
    });
}, 30_000);
