import { IntermediateRepresentation } from "@fern-api/api";
import { compile } from "@fern-api/compiler";
import { BUILD_PROJECT_SCRIPT_NAME, writeVolumeToDisk } from "@fern-typescript/commons";
import execa from "execa";
import { parseFernInput } from "fern-api";
import { rm, writeFile } from "fs/promises";
import IS_CI from "is-ci";
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
         * If true, generated files are built and compiled.
         * enforced to false on CI.
         */
        checkCompilation?: boolean;

        /**
         * If true, generated files are outputed to a generated/ directory.
         * enforced to false on CI
         */
        outputToDisk?: boolean;
    }
}

export async function runEteTest({
    directory,
    generateFiles,
    outputToDisk = false,
    checkCompilation = false,
}: runEteTest.Args): Promise<void> {
    const generatedDir = path.join(directory, "generated");
    await deleteDirectory(generatedDir);

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

    if (!IS_CI) {
        if (outputToDisk || checkCompilation) {
            await writeVolumeToDisk(volume, generatedDir);

            if (checkCompilation) {
                await installAndCompileGeneratedProject(generatedDir);
            }

            if (!outputToDisk) {
                await deleteDirectory(generatedDir);
            }
        }
    }

    // use "/" as the base directory since this full path is stored in the snapshot
    expect(volume.toJSON()).toMatchSnapshot();
}

function deleteDirectory(directory: string): Promise<void> {
    return rm(directory, { force: true, recursive: true });
}

export async function installAndCompileGeneratedProject(dir: string): Promise<void> {
    // write empty yarn.lock so yarn knows it's a standalone project
    await writeFile(path.join(dir, "yarn.lock"), "");
    await execa("yarn", ["install"], {
        cwd: dir,
        env: {
            // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
            YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
        },
    });
    await execa("yarn", [BUILD_PROJECT_SCRIPT_NAME], { cwd: dir });
}
