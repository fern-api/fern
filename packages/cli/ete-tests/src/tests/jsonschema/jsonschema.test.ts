import { readFile } from "fs/promises";

import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

describe("jsonschema", () => {
    it("works with latest version", async () => {
        const pathOfDirectory = await init();
        await runFernCli(["jsonschema", "schema.json", "--type", "imdb.Movie"], {
            cwd: pathOfDirectory,
            reject: false
        });

        const jsonSchema = JSON.parse(
            await readFile(join(pathOfDirectory, RelativeFilePath.of("schema.json")), "utf-8")
        );
        expect(jsonSchema).toMatchSnapshot();
    }, 20_000);
});
