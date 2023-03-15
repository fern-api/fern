import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidNavigationRule } from "../valid-navigation";

describe("valid-navigation", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidNavigationRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "Unexpected item: ./b.yml",
                nodePath: ["navigation"],
                relativeFilepath: "invalid-folder/__package__.yml",
                severity: "error",
            },
            {
                message: "Unexpected item: d.yml",
                nodePath: ["navigation"],
                relativeFilepath: "invalid-folder/__package__.yml",
                severity: "error",
            },
            {
                message: "__package__.yml cannot be specified in navigation.",
                nodePath: ["navigation"],
                relativeFilepath: "invalid-folder/__package__.yml",
                severity: "error",
            },
            {
                message: "Missing b.yml",
                nodePath: ["navigation"],
                relativeFilepath: "invalid-folder/__package__.yml",
                severity: "error",
            },
            {
                message: "Missing c.yml",
                nodePath: ["navigation"],
                relativeFilepath: "invalid-folder/__package__.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
