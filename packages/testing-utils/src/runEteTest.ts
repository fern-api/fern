import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { rm } from "fs/promises";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { installAndCompileGeneratedProject } from "./installAndCompileGeneratedProject";

export declare namespace runEteTest {
    export interface Args {
        /**
         * the file where the test lives.
         */
        testFile: string;

        /**
         * fixture for the ETE test. Should contain a src/ directory will the
         * fern yaml files.
         */
        pathToFixture: string;

        generateFiles: (args: {
            volume: Volume;
            intermediateRepresentation: IntermediateRepresentation;
        }) => void | Promise<void>;
    }
}

export async function runEteTest({ testFile, pathToFixture, generateFiles }: runEteTest.Args): Promise<void> {
    const testDirectory = path.dirname(testFile);

    const absolutePathToFixture = path.resolve(testDirectory, pathToFixture);

    const pathToGenerated = path.join(absolutePathToFixture, "generated");
    await deleteDirectory(pathToGenerated);

    const parseWorkspaceResult = await loadWorkspace({
        absolutePathToWorkspace: absolutePathToFixture,
        version: 1,
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
