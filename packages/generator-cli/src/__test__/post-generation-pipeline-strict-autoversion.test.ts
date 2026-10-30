import { afterEach, describe, expect, it, vi } from "vitest";
import type { PipelineLogger } from "../pipeline/index.js";
import { PostGenerationPipeline } from "../pipeline/index.js";
import { AutoVersionStep } from "../pipeline/steps/AutoVersionStep.js";
import { GithubStep } from "../pipeline/steps/GithubStep.js";
import type { GithubStepResult, PipelineConfig } from "../pipeline/types.js";

const silentLogger: PipelineLogger = {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined
};

function makeConfig(strict: boolean): PipelineConfig {
    return {
        outputDir: "/tmp/fake",
        autoVersion: { enabled: true, language: "typescript", strict },
        github: { enabled: true, uri: "owner/repo", token: "token", mode: "pull-request" }
    };
}

describe("PostGenerationPipeline strict autoversion", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("skips GithubStep when strict AutoVersionStep throws", async () => {
        vi.spyOn(AutoVersionStep.prototype, "execute").mockRejectedValue(new Error("git diff failed"));
        const githubSpy = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true } satisfies GithubStepResult);

        const result = await new PostGenerationPipeline(makeConfig(true), silentLogger).run();

        expect(result.success).toBe(false);
        expect(result.errors).toContain("autoVersion step error: git diff failed");
        expect(githubSpy).not.toHaveBeenCalled();
    });

    it("skips GithubStep when strict AutoVersionStep returns a failure", async () => {
        vi.spyOn(AutoVersionStep.prototype, "execute").mockResolvedValue({
            executed: true,
            success: false,
            errorMessage: "analysis unavailable"
        });
        const githubSpy = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true } satisfies GithubStepResult);

        const result = await new PostGenerationPipeline(makeConfig(true), silentLogger).run();

        expect(result.success).toBe(false);
        expect(githubSpy).not.toHaveBeenCalled();
    });

    it("still runs GithubStep after an AutoVersionStep throw when strict is unset", async () => {
        vi.spyOn(AutoVersionStep.prototype, "execute").mockRejectedValue(new Error("git diff failed"));
        const githubSpy = vi
            .spyOn(GithubStep.prototype, "execute")
            .mockResolvedValue({ executed: true, success: true } satisfies GithubStepResult);

        await new PostGenerationPipeline(makeConfig(false), silentLogger).run();

        expect(githubSpy).toHaveBeenCalledTimes(1);
    });
});
