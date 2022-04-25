import { IntermediateRepresentation } from "@fern-api/api";
import { compile } from "@fern-api/compiler";
import { writeFiles } from "@fern-typescript/commons";
import { parseFernDirectory } from "fern-api";
import { vol } from "memfs";
import path from "path";
import { Directory, Project } from "ts-morph";

export declare namespace runEteTest {
    export interface Args {
        /**
         * directory for the ETE test. Should contain a src/ directory will the
         * fern yaml files.
         */
        directory: string;

        generateFiles: (args: { directory: Directory; intermediateRepresentation: IntermediateRepresentation }) => void;

        /**
         * If true, generated files are outputed to a generated/ directory.
         * @default false
         */
        outputToDisk?: boolean;
    }
}

export async function runEteTest({ directory, generateFiles, outputToDisk = false }: runEteTest.Args): Promise<void> {
    const generatedDir = path.join(directory, "generated");

    const files = await parseFernDirectory(path.join(directory, "src"));
    const compilerResult = await compile(files);
    if (!compilerResult.didSucceed) {
        throw new Error(JSON.stringify(compilerResult.failure));
    }

    const project = new Project({
        useInMemoryFileSystem: true,
    });

    generateFiles({
        directory: project.createDirectory("src"),
        intermediateRepresentation: compilerResult.intermediateRepresentation,
    });

    await writeFiles("/", project, vol.promises);
    expect(vol.toJSON()).toMatchSnapshot();

    if (outputToDisk) {
        await writeFiles(generatedDir, project);
    }
}
