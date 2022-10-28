import { getDirectoryContents } from "@fern-api/fs-utils";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

it("fern add", async () => {
    const pathOfDirectory = await init();

    const add = async (generator: string) => {
        await runFernCli(["add", generator], {
            cwd: pathOfDirectory,
        });
    };

    await add("java");
    await add("typescript");
    await add("postman");
    await add("openapi");

    expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
}, 60_000);
