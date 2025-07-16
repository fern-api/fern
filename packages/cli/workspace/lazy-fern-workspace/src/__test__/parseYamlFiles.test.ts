import { YAMLException } from "js-yaml";

import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";

import { parseYamlFiles } from "../utils/parseYamlFiles";

const FILEPATH = RelativeFilePath.of("duplicate-key.yml");

describe("parseYamlFiles", () => {
    it("duplicate-key", async () => {
        const result = await parseYamlFiles([
            {
                absoluteFilepath: resolve(AbsoluteFilePath.of(__dirname), FILEPATH),
                relativeFilepath: FILEPATH,
                fileContents: `
key: hello
key: world`
            }
        ]);

        if (result.didSucceed) {
            throw new Error("Parsing succeeded");
        }

        const failure = result.failures[FILEPATH];
        if (failure == null) {
            throw new Error("Parsing succeeded");
        }

        if (!(failure.error instanceof YAMLException)) {
            throw new Error("Error is not a YAMLException");
        }

        expect(failure.error.message).toMatch(/duplicated mapping key/);
    });
});
