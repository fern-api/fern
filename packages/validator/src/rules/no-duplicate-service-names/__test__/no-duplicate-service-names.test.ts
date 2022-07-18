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
                message:
                    "Found duplicated service: \x1B[1mOneService\x1B[22m. Duplicate lives in another file src/2.yml",
            },
        ]);
    });
});
