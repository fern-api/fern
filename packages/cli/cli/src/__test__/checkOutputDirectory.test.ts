import { mkdir, writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { CliContext } from "../cli-context/CliContext";
import { checkOutputDirectory } from "../commands/generate/checkOutputDirectory";
import { getOutputDirectories } from "../persistence/output-directories/getOutputDirectories";
import { storeOutputDirectories } from "../persistence/output-directories/storeOutputDirectories";

vi.mock("../utils/isCI", () => ({
    isCI: vi.fn().mockReturnValue(false)
}));

describe.sequential("checkOutputDirectory", () => {
    let mockCliContext: {
        confirmPrompt: Mock & ((message: string, defaultValue?: boolean) => Promise<boolean>);
    };

    beforeEach(() => {
        process.env = {};
        mockCliContext = {
            confirmPrompt: vi.fn().mockImplementation(async () => true)
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("doesn't prompt if directory doesn't exist", async () => {
        const tmpDir = await tmp.dir();
        const nonExistentPath = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("non-existent"));

        const result = await checkOutputDirectory(nonExistentPath, mockCliContext as unknown as CliContext, false);

        expect(result).toEqual({
            shouldProceed: true
        });
        expect(mockCliContext.confirmPrompt).not.toHaveBeenCalled();
    });

    it("doesn't prompt if directory is empty", async () => {
        const tmpDir = await tmp.dir();
        const emptyDir = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("empty"));
        await mkdir(emptyDir);

        const result = await checkOutputDirectory(emptyDir, mockCliContext as unknown as CliContext, false);

        expect(result).toEqual({
            shouldProceed: true
        });
        expect(mockCliContext.confirmPrompt).not.toHaveBeenCalled();
    });

    it("prompts for confirmation if directory has files and not in safelist", async () => {
        const tmpDir = await tmp.dir();
        const dirWithFiles = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("with-files"));
        await mkdir(dirWithFiles);
        await writeFile(join(dirWithFiles, RelativeFilePath.of("test.txt")), "test");

        mockCliContext.confirmPrompt.mockResolvedValueOnce(true);

        const result = await checkOutputDirectory(dirWithFiles, mockCliContext as unknown as CliContext, false);

        expect(result).toEqual({
            shouldProceed: true
        });
        expect(mockCliContext.confirmPrompt).toHaveBeenCalledTimes(1);
    });

    it("doesn't prompt if directory is in safelist", async () => {
        const tmpDir = await tmp.dir();
        const safelistedDir = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("safelisted"));
        await mkdir(safelistedDir);
        await writeFile(join(safelistedDir, RelativeFilePath.of("test.txt")), "test");

        // Add to safelist
        await storeOutputDirectories([safelistedDir]);

        const result = await checkOutputDirectory(safelistedDir, mockCliContext as unknown as CliContext, false);

        expect(result).toEqual({
            shouldProceed: true
        });
        expect(mockCliContext.confirmPrompt).not.toHaveBeenCalled();
    });

    it("saves directory to safelist when requested", async () => {
        const tmpDir = await tmp.dir();
        const dirToSafelist = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("to-safelist"));
        await mkdir(dirToSafelist);
        await writeFile(join(dirToSafelist, RelativeFilePath.of("test.txt")), "test");

        mockCliContext.confirmPrompt.mockResolvedValueOnce(true);

        const result = await checkOutputDirectory(dirToSafelist, mockCliContext as unknown as CliContext, false);

        expect(result).toEqual({
            shouldProceed: true
        });

        // Verify directory was added to safelist
        const savedDirectories = await getOutputDirectories();
        expect(savedDirectories).toContain(dirToSafelist);
    });

    it("doesn't proceed if user declines overwrite", async () => {
        const tmpDir = await tmp.dir();
        const dirWithFiles = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("with-files"));
        await mkdir(dirWithFiles);
        await writeFile(join(dirWithFiles, RelativeFilePath.of("test.txt")), "test");

        mockCliContext.confirmPrompt.mockResolvedValueOnce(false); // overwrite prompt

        const result = await checkOutputDirectory(dirWithFiles, mockCliContext as unknown as CliContext, false);

        expect(result).toEqual({
            shouldProceed: false
        });
        expect(mockCliContext.confirmPrompt).toHaveBeenCalledTimes(1);
    });

    it("doesn't prompt if force is true", async () => {
        const tmpDir = await tmp.dir();
        const dirWithFiles = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("with-files"));
        await mkdir(dirWithFiles);
        await writeFile(join(dirWithFiles, RelativeFilePath.of("test.txt")), "test");

        const result = await checkOutputDirectory(dirWithFiles, mockCliContext as unknown as CliContext, true);

        expect(result).toEqual({ shouldProceed: true });
        expect(mockCliContext.confirmPrompt).not.toHaveBeenCalled();
    });
});
