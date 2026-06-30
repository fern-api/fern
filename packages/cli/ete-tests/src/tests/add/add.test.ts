import { getDirectoryContentsForSnapshot } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "../init/init.js";

describe("fern add", () => {
    it("fern add <generator>", async ({ signal }) => {
        const pathOfDirectory = await init({ signal });

        const add = async (generator: string) => {
            await runFernCli(["add", generator], { cwd: pathOfDirectory, signal });
        };

        await add("fernapi/fern-java-sdk");
        await add("fern-postman");

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).not.toBeNull();
    }, 180_000);

    it("fern add <generator> --group sdk", async ({ signal }) => {
        const pathOfDirectory = await init({ signal });

        const add = async (generator: string, groupName: string) => {
            await runFernCli(["add", generator, "--group", groupName], { cwd: pathOfDirectory, signal });
        };

        await add("fern-typescript", "typescript");

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).toMatchSnapshot();
    }, 180_000);
});
