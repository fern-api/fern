import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { createTestContextWithCapture } from "../../../../__test__/utils/createTestContext.js";
import type { Workspace } from "../../../../workspace/Workspace.js";
import { MigrateCommand } from "../command.js";

const SIMPLE_API_DIR = AbsoluteFilePath.of(join(__dirname, "../../../../__test__/fixtures/simple-api"));

function args(): MigrateCommand.Args {
    return {
        "log-level": "info",
        force: false,
        output: "-",
        strict: false
    };
}

describe("fern sdk migrate Git output", () => {
    it("preserves Git delivery and normalizes Maven publication through the resolved invocation", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const sdkConfig = workspace.sdks;
        const target = sdkConfig?.targets[0];
        if (sdkConfig == null || target == null) {
            throw new Error("Expected an SDK target in test workspace");
        }
        const workspaceWithGitPublication: Workspace = {
            ...workspace,
            sdks: {
                ...sdkConfig,
                targets: [
                    {
                        ...target,
                        image: "fernapi/fern-java-sdk",
                        lang: "java",
                        output: { git: { repository: "acme/sdk", mode: "pr" } },
                        publish: { maven: { coordinate: " com.acme : sdk " } }
                    }
                ]
            }
        };
        Object.defineProperty(context, "loadWorkspaceOrThrow", { value: async () => workspaceWithGitPublication });

        await new MigrateCommand().handle(context, args());

        const sdkConfigOutput = JSON.parse(getStdout()) as { targets: unknown[] };
        expect(sdkConfigOutput.targets[0]).toMatchObject({
            package: { artifactId: "sdk", groupId: "com.acme" },
            output: {
                delivery: "github",
                github: { repository: "acme/sdk", mode: "pull-request" },
                publish: { registry: "maven" }
            }
        });
    });
});
