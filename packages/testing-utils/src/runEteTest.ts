import { AbsoluteFilePath, dirname, join, RelativeFilePath, resolve } from "@fern-api/core-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import execa from "execa";
import { readFile, rm } from "fs/promises";
import { Volume } from "memfs/lib/volume";
import path from "path";
import tmp from "tmp-promise";
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
        pathToFixture: string;

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

    const tmpDir = await tmp.dir();
    const irPath = path.join(tmpDir.path, "ir.json");

    await execa("fern", ["ir", irPath, "--api", testDirectory, "--language", "typescript"], {
        cwd: absolutePathToFixture,
    });

    const intermediateRepresentation: IntermediateRepresentation = JSON.parse((await readFile(irPath)).toString());

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
