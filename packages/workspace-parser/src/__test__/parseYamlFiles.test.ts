import { YAMLException } from "js-yaml";
import { parseYamlFiles } from "../parseYamlFiles";

describe("parseYamlFiles", () => {
    it("duplicate-key", async () => {
        const result = await parseYamlFiles([
            {
                filepath: "duplicate-key.yml",
                fileContents: `
key: hello
key: world`,
            },
        ]);

        if (result.didSucceed) {
            throw new Error("Parsing succeeded");
        }

        const failure = result.failures["duplicate-key.yml"];
        if (failure == null) {
            throw new Error("Parsing succeeded");
        }

        if (!(failure.error instanceof YAMLException)) {
            throw new Error("Error is not a YAMLException");
        }

        expect(failure.error.message).toMatch(/duplicated mapping key/);
    });
});
