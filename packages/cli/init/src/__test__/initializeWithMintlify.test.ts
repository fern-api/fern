import { vi } from "vitest";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbsoluteFilePath, cwd, resolve } from "@fern-api/fs-utils";
import { runMintlifyMigration } from "@fern-api/mintlify-importer";

import { initializeWithMintlify } from "../initializeWithMintlify";

// We'll mock calling runMintlifyMigration instead of actually calling it
vi.mock("@fern-api/mintlify-importer", () => ({
    runMintlifyMigration: vi.fn()
}));

describe("initializeWithMintlify", () => {
    it("Throws an error if the user provides a URL", async () => {
        // We don't need to test the task context in this test, so we can type cast as any
        const taskContext = {
            failAndThrow: vi.fn((errorMessage: string) => {
                throw new Error(errorMessage);
            })
        } as any;

        await expect(
            initializeWithMintlify({
                pathToMintJson: "https://example.com/mint.json",
                taskContext,
                versionOfCli: "0.0.0"
            })
        ).rejects.toThrow();

        expect(taskContext.failAndThrow).toHaveBeenCalledWith(
            "Clone the repo locally and run this command again by referencing the path to the local mint.json file"
        );
    });

    it("Throws an error if the user does not provide a path to a mint.json file", async () => {
        // We don't need to test the task context in this test, so we can type cast as any
        const taskContext = {
            failAndThrow: vi.fn((errorMessage: string) => {
                throw new Error(errorMessage);
            })
        } as any;

        await expect(
            initializeWithMintlify({
                pathToMintJson: "./mint.yml",
                taskContext,
                versionOfCli: "0.0.0"
            })
        ).rejects.toThrow();

        expect(taskContext.failAndThrow).toHaveBeenCalledWith("Provide a path to a mint.json file");
    });

    it("Throws an error if the mint.json file does not exist", async () => {
        // We don't need to test the task context in this test, so we can type cast as any
        const taskContext = {
            failAndThrow: vi.fn((errorMessage: string) => {
                throw new Error(errorMessage);
            })
        } as any;

        await expect(
            initializeWithMintlify({
                pathToMintJson: "./mint.json",
                taskContext,
                versionOfCli: "0.0.0"
            })
        ).rejects.toThrow();

        const absolutePathToMintJson = resolve(cwd(), "./mint.json");

        expect(taskContext.failAndThrow).toHaveBeenCalledWith(`${absolutePathToMintJson} does not exist`);
    });

    it("Successfully runs the mintlify migration if a proper mint.json file is provided", async () => {
        const taskContext = {
            failAndThrow: vi.fn((errorMessage: string) => {
                throw new Error(errorMessage);
            })
        } as any;

        const absolutePathToMintJson = resolve(cwd(), "./src/__test__/fixtures/mintlify/mint.json");
        const outputPath = AbsoluteFilePath.of(cwd());

        await initializeWithMintlify({
            pathToMintJson: absolutePathToMintJson,
            taskContext,
            versionOfCli: "0.0.0"
        });

        expect(taskContext.failAndThrow).not.toHaveBeenCalled();

        expect(runMintlifyMigration).toHaveBeenCalledWith({
            absolutePathToMintJson,
            outputPath,
            taskContext,
            versionOfCli: "0.0.0"
        });
    });
});
