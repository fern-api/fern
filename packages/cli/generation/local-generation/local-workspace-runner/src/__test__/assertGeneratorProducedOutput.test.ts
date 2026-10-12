import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertGeneratorProducedOutput } from "../runGenerator.js";

describe("assertGeneratorProducedOutput", () => {
    let dir: string;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), "fern-generator-output-"));
    });

    afterEach(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    it("throws a container error when the generator wrote nothing", async () => {
        const promise = assertGeneratorProducedOutput({
            generatorName: "fernapi/fern-typescript-sdk",
            absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(dir)
        });
        await expect(promise).rejects.toBeInstanceOf(CliError);
        await expect(promise).rejects.toMatchObject({ code: CliError.Code.ContainerError });
        await expect(promise).rejects.toThrow(/exited without writing any files/);
    });

    it("throws when the output directory does not exist", async () => {
        await expect(
            assertGeneratorProducedOutput({
                generatorName: "fernapi/fern-typescript-sdk",
                absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(join(dir, "missing"))
            })
        ).rejects.toThrow(/exited without writing any files/);
    });

    it("passes when the generator wrote a file", async () => {
        await writeFile(join(dir, "package.json"), "{}");
        await expect(
            assertGeneratorProducedOutput({
                generatorName: "fernapi/fern-typescript-sdk",
                absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(dir)
            })
        ).resolves.toBeUndefined();
    });

    it("passes when the generator wrote only a directory", async () => {
        await mkdir(join(dir, "src"));
        await expect(
            assertGeneratorProducedOutput({
                generatorName: "fernapi/fern-typescript-sdk",
                absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(dir)
            })
        ).resolves.toBeUndefined();
    });
});
