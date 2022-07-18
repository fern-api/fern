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
                message: "Found duplicated id: \x1B[1mAnimalId\x1B[22m. Duplicate lives in another file src/simple.yml",
            },
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["ids", "PersonId"],
                message: "Found duplicated id: \x1B[1mPersonId\x1B[22m. Duplicate lives in same file src/simple.yml",
            },
        ]);
    });
});
