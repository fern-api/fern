import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "../init/init.js";

describe("jsonschema", () => {
    it("works with latest version", async ({ signal }) => {
        const pathOfDirectory = await init({ additionalArgs: [{ name: "--fern-definition" }], signal });
        await runFernCli(["jsonschema", "schema.json", "--type", "imdb.Movie"], {
            cwd: pathOfDirectory,
            reject: false,
            signal
        });

        const jsonSchema = JSON.parse(
            await readFile(join(pathOfDirectory, RelativeFilePath.of("schema.json")), "utf-8")
        );
        expect(jsonSchema).toMatchSnapshot();
    }, 20_000);
});
