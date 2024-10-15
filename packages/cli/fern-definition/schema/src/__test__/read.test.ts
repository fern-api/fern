import { visitRawTypeDeclaration } from "../utils/visitRawTypeDeclaration";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import * as serialization from "../sdk/serialization";

describe("read.test.ts", () => {
    it("extends with no properties", async () => {
        const fileContents = await readFile(
            "/Users/dsinghvi/Git/fern/packages/cli/fern-definition/schema/src/__test__/inlined.yml",
            "utf8"
        );

        // Parse YAML
        const data = yaml.load(fileContents);

        const fernfile = serialization.FernFile.parseOrThrow(data);
        console.log(JSON.stringify(fernfile));
    });
});
