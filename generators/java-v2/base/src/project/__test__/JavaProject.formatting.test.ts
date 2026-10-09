import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AbstractJavaGeneratorContext } from "../../context/AbstractJavaGeneratorContext.js";
import { JavaProject } from "../JavaProject.js";

const loggingExecaMock = vi.fn();
vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: (...args: unknown[]) => loggingExecaMock(...args)
}));

async function createProjectWithGradlew(): Promise<JavaProject> {
    const outputDirectory = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "java-project-")));
    await writeFile(join(outputDirectory, RelativeFilePath.of("gradlew")), "#!/bin/sh\n");

    // Test double: persist() only reads config.output.path, customConfig, and logger.
    const context = {
        config: { output: { path: outputDirectory } },
        customConfig: {} satisfies Partial<BaseJavaCustomConfigSchema>,
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() }
    } as unknown as AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema>;

    return new JavaProject({ context });
}

describe("JavaProject formatting", () => {
    beforeEach(() => {
        loggingExecaMock.mockReset();
        delete process.env.FERN_JAVA_SKIP_FORMATTING;
    });

    afterEach(() => {
        delete process.env.FERN_JAVA_SKIP_FORMATTING;
    });

    it("runs spotlessApply by default", async () => {
        const project = await createProjectWithGradlew();
        await project.persist();
        expect(loggingExecaMock).toHaveBeenCalledOnce();
        expect(loggingExecaMock.mock.calls[0]?.[1]).toBe("./gradlew");
    });

    it("runs no gradle command when FERN_JAVA_SKIP_FORMATTING is set", async () => {
        process.env.FERN_JAVA_SKIP_FORMATTING = "true";
        const project = await createProjectWithGradlew();
        await project.persist();
        expect(loggingExecaMock).not.toHaveBeenCalled();
    });

    it("still runs spotlessApply when FERN_JAVA_SKIP_FORMATTING is set to a falsy value", async () => {
        process.env.FERN_JAVA_SKIP_FORMATTING = "false";
        const project = await createProjectWithGradlew();
        await project.persist();
        expect(loggingExecaMock).toHaveBeenCalledOnce();
    });
});
