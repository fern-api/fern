import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ImportFileExistsRule } from "../import-file-exists";

describe("import-file-exists", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ImportFileExistsRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                message: "Import missing points to non-existent path missing/missing.yml.",
                nodePath: ["imports", "missing/missing.yml"],
                relativeFilePath: "src/root.yml",
                severity: "error",
            },
            {
                message: "Import missing points to non-existent path ./missing.yml.",
                nodePath: ["imports", "./missing.yml"],
                relativeFilePath: "src/subfolder-a/a.yml",
                severity: "error",
            },
            {
                message: "Import doesNotExist points to non-existent path ../subfolder-a/a.",
                nodePath: ["imports", "../subfolder-a/a"],
                relativeFilePath: "src/subfolder-b/b.yml",
                severity: "error",
            },
        ]);
    });
});
