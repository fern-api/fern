import { IntermediateRepresentation } from "@fern-api/api";
import { parseFernInput } from "@fern-api/cli";
import { compile } from "@fern-api/compiler";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import execa from "execa";
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

    let checkCompilation = true;
    if (IS_CI) {
        outputToDisk = false;
        checkCompilation = await hasFileChangedOnBranchInCI(
            path.join(testDirectory, "__snapshots__", `${path.basename(testFile)}.snap`)
        );
    }

    const absolutePathToFixture = path.resolve(testDirectory, pathToFixture);

    const pathToGenerated = path.join(absolutePathToFixture, "generated");
    await deleteDirectory(pathToGenerated);

    const files = await parseFernInput(path.join(absolutePathToFixture, "src"));
    const compilerResult = await compile(files, undefined);
    if (!compilerResult.didSucceed) {
        throw new Error(JSON.stringify(compilerResult.failure));
    }

    const volume = new Volume();

    await generateFiles({
        volume,
        intermediateRepresentation: compilerResult.intermediateRepresentation,
    });

    if (outputToDisk || checkCompilation) {
        await writeVolumeToDisk(volume, pathToGenerated);

        if (checkCompilation) {
            await installAndCompileGeneratedProject(pathToGenerated);
        }

        if (!outputToDisk) {
            await deleteDirectory(pathToGenerated);
        }
    }

    expect(volume.toJSON()).toMatchSnapshot();
}

function deleteDirectory(pathToDirectory: string): Promise<void> {
    return rm(pathToDirectory, { force: true, recursive: true });
}

const BRANCH_ENV_VAR = "CIRCLE_BRANCH";
async function hasFileChangedOnBranchInCI(filepath: string): Promise<boolean> {
    const branch = process.env[BRANCH_ENV_VAR] ?? "zk/root-level-jest";
    if (branch == null) {
        throw new Error(`Cannot check if file has changed because ${BRANCH_ENV_VAR} is not defined`);
    }

    try {
        const mergeBaseResult = await execa("git", ["merge-base", branch, "main"]);
        await execa("git", ["diff", "--exit-code", "--quiet", branch, mergeBaseResult.stdout, filepath]);
        return false;
    } catch (e) {
        return true;
    }
}
