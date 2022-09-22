import { AbsoluteFilePath, dirname, FilePath, join, RelativeFilePath, resolve } from "@fern-api/core-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { rm } from "fs/promises";
import { Volume } from "memfs/lib/volume";
import { installAndCompileGeneratedProject } from "./installAndCompileGeneratedProject";

export declare namespace runEteTest {
    export interface Args {
        /**
         * the file where the test lives.
         */
        testFile: AbsoluteFilePath;

        /**
         * fixture for the ETE test. Should contain a src/ directory will the
         * fern yaml files.
         */
        pathToFixture: FilePath;

        generateFiles: (args: {
            volume: Volume;
            intermediateRepresentation: IntermediateRepresentation;
        }) => void | Promise<void>;
    }
}

export async function runEteTest({ testFile, pathToFixture, generateFiles }: runEteTest.Args): Promise<void> {
    const testDirectory = dirname(testFile);

    const absolutePathToFixture = resolve(testDirectory, pathToFixture);

    const pathToGenerated = join(absolutePathToFixture, RelativeFilePath.of("generated"));
    await deleteDirectory(pathToGenerated);

    const parseWorkspaceResult = await loadWorkspace({
        absolutePathToWorkspace: absolutePathToFixture,
    });
    if (!parseWorkspaceResult.didSucceed) {
        throw new Error(JSON.stringify(parseWorkspaceResult.failures));
    }
    const intermediateRepresentation = await generateIntermediateRepresentation(parseWorkspaceResult.workspace);

    const volume = new Volume();

    await generateFiles({
        volume,
        intermediateRepresentation,
    });

    await writeVolumeToDisk(volume, pathToGenerated);
    await installAndCompileGeneratedProject(pathToGenerated);

    expect(volume.toJSON()).toMatchSnapshot();
}

function deleteDirectory(pathToDirectory: string): Promise<void> {
    return rm(pathToDirectory, { force: true, recursive: true });
}
