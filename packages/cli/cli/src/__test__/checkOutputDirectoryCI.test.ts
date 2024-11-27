import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { checkOutputDirectory } from "../commands/generate/checkOutputDirectory";
import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";

describe("checkOutputDirectory in CI", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let mockCliContext: {
        confirmPrompt: Mock;
    };

    beforeEach(() => {
        originalEnv = process.env;
        process.env = {
            ...process.env,
            CI: "true"
        };

        mockCliContext = {
            confirmPrompt: vi.fn()
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("doesn't prompt in CI environment even with files present", async () => {
        const tmpDir = await tmp.dir();
        const dirWithFiles = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("with-files"));
        await mkdir(dirWithFiles);
        await writeFile(join(dirWithFiles, RelativeFilePath.of("test.txt")), "test");

        const result = await checkOutputDirectory(dirWithFiles, mockCliContext as any, false);

        expect(result).toEqual({
            shouldProceed: true
        });
        expect(mockCliContext.confirmPrompt).not.toHaveBeenCalled();
    });
});
