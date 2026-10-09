import { loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace } from "@fern-api/lazy-fern-workspace";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidationViolation } from "../../../ValidationViolation.js";
import { validateGeneratorsWorkspace } from "../../../validateGeneratorsWorkspace.js";
import { NoDirectRubyGemsPublishingRule } from "../no-direct-rubygems-publishing.js";

function fixture(name: string): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"), RelativeFilePath.of(name));
}

describe("no-direct-rubygems-publishing", () => {
    it("flags rubygems output without a github block", async () => {
        const violations = await getViolationsForRule({
            rule: NoDirectRubyGemsPublishingRule,
            absolutePathToWorkspace: fixture("direct")
        });

        const expectedViolations: ValidationViolation[] = [
            {
                name: "no-direct-rubygems-publishing",
                severity: "error",
                relativeFilepath: RelativeFilePath.of("generators.yml"),
                nodePath: ["groups", "ruby-direct", "generators", "0", "fernapi/fern-ruby-sdk"],
                message:
                    "Direct RubyGems publishing is not supported. Add a github block to this generator (for example, github: { repository: your-org/your-ruby-sdk }) so the gem is published by the GitHub Actions workflow generated in that repository."
            }
        ];
        expect(violations).toEqual(expectedViolations);
    });

    it("allows rubygems output published through a github block", async () => {
        const violations = await getViolationsForRule({
            rule: NoDirectRubyGemsPublishingRule,
            absolutePathToWorkspace: fixture("github")
        });

        expect(violations).toEqual([]);
    });

    it("only runs during fern check, not generation-time validation", async () => {
        const context = createMockTaskContext();
        const absolutePathToWorkspace = fixture("direct");
        const workspace = await new LazyFernWorkspace({
            absoluteFilePath: absolutePathToWorkspace,
            generatorsConfiguration: await loadGeneratorsConfiguration({ absolutePathToWorkspace, context }),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        }).toFernWorkspace({ context });

        const generationViolations = await validateGeneratorsWorkspace(workspace, CONSOLE_LOGGER);
        const checkViolations = await validateGeneratorsWorkspace(workspace, CONSOLE_LOGGER, {
            includeCheckOnlyRules: true
        });

        expect(generationViolations).toEqual([]);
        expect(checkViolations.map((violation) => violation.name)).toEqual(["no-direct-rubygems-publishing"]);
    });
});
