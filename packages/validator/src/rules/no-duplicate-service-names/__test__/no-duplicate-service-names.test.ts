import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateServiceNames } from "../no-duplicate-service-names";

describe("no-duplicate-ids", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateServiceNames,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                severity: "error",
                relativeFilePath: "src/2.yml",
                nodePath: ["services", "http", "OneService"],
                message: "A service with the name OneService is already declared in src/1.yml.",
            },
        ]);
    });
});
