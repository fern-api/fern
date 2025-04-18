import { getDirectoryContents, getDirectoryContentsForSnapshot } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

describe("fern add", () => {
    it("fern add <generator>", async () => {
        const pathOfDirectory = await init();

        const add = async (generator: string) => {
            await runFernCli(["add", generator], {
                cwd: pathOfDirectory
            });
        };

        await add("fernapi/fern-java-sdk");
        await add("fern-postman");

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).not.toBeNull();
    }, 60_000);

    it("fern add <generator> --group sdk", async () => {
        const pathOfDirectory = await init();

        const add = async (generator: string, groupName: string) => {
            await runFernCli(["add", generator, "--group", groupName], {
                cwd: pathOfDirectory
            });
        };

        await add("fern-typescript", "typescript");

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);
});
