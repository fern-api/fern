import { IntermediateRepresentation } from "@fern-api/api";
import { compileTypescript } from "@fern-api/commons";
import { compile } from "@fern-api/compiler";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { parseFernInput } from "fern-api";
import { rm } from "fs/promises";
import { Volume } from "memfs/lib/volume";
import path from "path";

export declare namespace runEteTest {
    export interface Args {
        /**
         * directory for the ETE test. Should contain a src/ directory will the
         * fern yaml files.
         */
        directory: string;

        generateFiles: (args: {
            volume: Volume;
            intermediateRepresentation: IntermediateRepresentation;
        }) => void | Promise<void>;

        /**
         * If true, generated files are outputed to a generated/ directory.
         */
        outputToDisk?: boolean;
    }
}

export async function runEteTest({ directory, generateFiles, outputToDisk = false }: runEteTest.Args): Promise<void> {
    const generatedDir = path.join(directory, "generated");

    const files = await parseFernInput(path.join(directory, "src"));
    const compilerResult = await compile(files, undefined);
    if (!compilerResult.didSucceed) {
        throw new Error(JSON.stringify(compilerResult.failure));
    }

    const volume = new Volume();

    await generateFiles({
        volume,
        intermediateRepresentation: compilerResult.intermediateRepresentation,
    });

    // write to disk to check compilation
    await deleteDirectory(generatedDir);
    await writeVolumeToDisk(volume, generatedDir);
    await compileTypescript(generatedDir);
    if (!outputToDisk) {
        await deleteDirectory(generatedDir);
    }

    // use "/" as the base directory since this full path is stored in the snapshot
    expect(volume.toJSON()).toMatchSnapshot();
}

function deleteDirectory(directory: string): Promise<void> {
    return rm(directory, { force: true, recursive: true });
}
