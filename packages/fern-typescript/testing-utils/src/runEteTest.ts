import { IntermediateRepresentation } from "@fern-api/api";
import { compileTypescript } from "@fern-api/commons";
import { compile } from "@fern-api/compiler";
import { withProject, writeFiles } from "@fern-typescript/commons";
import { parseFernInput } from "fern-api";
import { rm } from "fs/promises";
import { vol } from "memfs";
import path from "path";
import { Directory } from "ts-morph";

export declare namespace runEteTest {
    export interface Args {
        /**
         * directory for the ETE test. Should contain a src/ directory will the
         * fern yaml files.
         */
        directory: string;

        generateFiles: (args: {
            directory: Directory;
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

    const project = await withProject(async (p) => {
        await generateFiles({
            directory: p.createDirectory("/"),
            intermediateRepresentation: compilerResult.intermediateRepresentation,
        });
    });

    // write to disk to check compilation
    await deleteDirectory(generatedDir);
    await writeFiles(generatedDir, project);
    await compileTypescript(generatedDir);
    if (!outputToDisk) {
        await deleteDirectory(generatedDir);
    }

    // use "/" as the base directory since this full path is stored in the snapshot
    await writeFiles("/", project, vol.promises);
    expect(vol.toJSON()).toMatchSnapshot();
}

function deleteDirectory(directory: string): Promise<void> {
    return rm(directory, { force: true, recursive: true });
}
