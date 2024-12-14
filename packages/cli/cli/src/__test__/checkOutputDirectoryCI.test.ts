import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { checkOutputDirectory } from "../commands/generate/checkOutputDirectory";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CliContext } from "../cli-context/CliContext";
import { isCI } from "../utils/isCI";

vi.mock("../utils/isCI", () => ({
    isCI: vi.fn().mockReturnValue(true)
}));

describe.sequential("checkOutputDirectory in CI", () => {
    let mockCliContext: Partial<CliContext>;

    beforeEach(() => {
        mockCliContext = {
            confirmPrompt: vi.fn()
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("doesn't prompt in CI environment even with files present", async () => {
        const tmpDir = await tmp.dir();
        const dirWithFiles = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("with-files"));
        await mkdir(dirWithFiles);
        await writeFile(join(dirWithFiles, RelativeFilePath.of("test.txt")), "test");

        const result = await checkOutputDirectory(dirWithFiles, mockCliContext as CliContext, false);

        expect(result).toEqual({
            shouldProceed: true
        });
        expect(mockCliContext.confirmPrompt).not.toHaveBeenCalled();
    });
});
