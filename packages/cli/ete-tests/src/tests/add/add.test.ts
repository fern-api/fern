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

    await add("fernapi/fern-java-sdk");
    await add("fern-typescript-sdk");
    await add("fern-postman");
    await add("fern-openapi");

    expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
}, 60_000);
