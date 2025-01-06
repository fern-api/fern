import { mkdir, writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { describe, expect, it, vi } from "vitest";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { CliContext } from "../cli-context/CliContext";
import { checkOutputDirectory } from "../commands/generate/checkOutputDirectory";

describe.sequential("checkOutputDirectory in CI", () => {
    it("doesn't prompt in CI environment even with files present", async () => {
        process.env.CI = "true";
        const tmpDir = await tmp.dir();
        const dirWithFiles = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("with-files"));
        await mkdir(dirWithFiles);
        await writeFile(join(dirWithFiles, RelativeFilePath.of("test.txt")), "test");

        const mockCliContext = {
            confirmPrompt: vi.fn().mockImplementation(async () => true)
        };
        const result = await checkOutputDirectory(dirWithFiles, mockCliContext as unknown as CliContext, false);

        expect(result).toEqual({
            shouldProceed: true
        });
        expect(mockCliContext.confirmPrompt).not.toHaveBeenCalled();
    });
});
