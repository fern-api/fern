import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateIdsRule } from "../no-duplicate-ids";

describe("no-duplicate-ids", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateIdsRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["ids", "AnimalId"],
                message: "The ID AnimalId is already declared in src/other.yml.",
            },
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["ids", "PersonId"],
                message: "The ID PersonId is already declared.",
            },
        ]);
    });
});
