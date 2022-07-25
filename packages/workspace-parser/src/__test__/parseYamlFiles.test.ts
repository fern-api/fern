import { RelativeFilePath } from "@fern-api/config-management-commons";
import { YAMLException } from "js-yaml";
import { parseYamlFiles } from "../parseYamlFiles";

const FILEPATH = "duplicate-key.yml" as RelativeFilePath;

describe("parseYamlFiles", () => {
    it("duplicate-key", async () => {
        const result = await parseYamlFiles([
            {
                filepath: FILEPATH,
                fileContents: `
key: hello
key: world`,
            },
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
