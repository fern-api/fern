import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { parseWorkspaceDefinition } from "@fern-api/workspace-parser";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { rm } from "fs/promises";
import IS_CI from "is-ci";
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

        /**
         * If true, generated files are outputed to a generated/ directory.
         * enforced to false on CI
         */
        outputToDisk?: boolean;
    }
}

export async function runEteTest({
    testFile,
    pathToFixture,
    generateFiles,
    outputToDisk = false,
}: runEteTest.Args): Promise<void> {
    const testDirectory = path.dirname(testFile);

    outputToDisk &&= !IS_CI;

    const absolutePathToFixture = path.resolve(testDirectory, pathToFixture);

    const pathToGenerated = path.join(absolutePathToFixture, "generated");
    await deleteDirectory(pathToGenerated);

    const parseWorkspaceResult = await parseWorkspaceDefinition({
        name: undefined,
        absolutePathToDefinition: path.join(absolutePathToFixture, "src"),
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

    if (!outputToDisk) {
        await deleteDirectory(pathToGenerated);
    }

    expect(volume.toJSON()).toMatchSnapshot();
}

function deleteDirectory(pathToDirectory: string): Promise<void> {
    return rm(pathToDirectory, { force: true, recursive: true });
}
