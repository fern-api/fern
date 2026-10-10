import { loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace } from "@fern-api/lazy-fern-workspace";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidationViolation } from "../../../ValidationViolation.js";
import { validateGeneratorsWorkspace } from "../../../validateGeneratorsWorkspace.js";
import { UnsignedMavenPublishingRule } from "../unsigned-maven-publishing.js";

const EXPECTED_MESSAGE =
    "Maven output for fernapi/fern-java-sdk has no `signature` and no `url`. Maven Central requires signed artifacts, so this publish will be uploaded to the Central Portal staging service but never released. Add `signature` to publish to Maven Central, or set `url` to publish to another registry.";

function fixture(name: string): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"), RelativeFilePath.of(name));
}

describe("unsigned-maven-publishing", () => {
    it("warns on direct and GitHub-delivered Maven outputs without signature or url", async () => {
        const violations = await getViolationsForRule({
            rule: UnsignedMavenPublishingRule,
            absolutePathToWorkspace: fixture("unsigned")
        });

        const expectedViolations: ValidationViolation[] = [
            {
                name: "unsigned-maven-publishing",
                severity: "warning",
                relativeFilepath: RelativeFilePath.of("generators.yml"),
                nodePath: ["groups", "java-direct", "generators", "0", "fernapi/fern-java-sdk"],
                message: EXPECTED_MESSAGE
            },
            {
                name: "unsigned-maven-publishing",
                severity: "warning",
                relativeFilepath: RelativeFilePath.of("generators.yml"),
                nodePath: ["groups", "java-github", "generators", "0", "fernapi/fern-java-sdk"],
                message: EXPECTED_MESSAGE
            }
        ];
        expect(violations).toEqual(expectedViolations);
    });

    it("does not warn when a signature or url is configured, or for non-Maven outputs", async () => {
        const violations = await getViolationsForRule({
            rule: UnsignedMavenPublishingRule,
            absolutePathToWorkspace: fixture("configured")
        });

        expect(violations).toEqual([]);
    });

    it("runs during generation-time validation as a warning, not an error", async () => {
        const context = createMockTaskContext();
        const absolutePathToWorkspace = fixture("unsigned");
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

        for (const violations of [generationViolations, checkViolations]) {
            const mavenViolations = violations.filter((violation) => violation.name === "unsigned-maven-publishing");
            expect(mavenViolations).toHaveLength(2);
            expect(mavenViolations.every((violation) => violation.severity === "warning")).toBe(true);
        }
    });
});
