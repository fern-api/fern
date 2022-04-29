import { IntermediateRepresentation } from "@fern-api/api";
import { compile } from "@fern-api/compiler";
import { withProject, writeFiles } from "@fern-typescript/commons";
import { parseFernDirectory } from "fern-api";
import { rm } from "fs/promises";
import glob from "glob";
import { vol } from "memfs";
import path from "path";
import { Directory } from "ts-morph";
import ts from "typescript";
import { promisify } from "util";

const promisifiedGlob = promisify(glob);

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

    const project = withProject((p) => {
        generateFiles({
            directory: p.createDirectory("src"),
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

    await writeFiles("/", project, vol.promises);
    expect(vol.toJSON()).toMatchSnapshot();
}

function deleteDirectory(directory: string): Promise<void> {
    return rm(directory, { force: true, recursive: true });
}

async function compileTypescript(directory: string) {
    const typescriptFileNames = await promisifiedGlob("**/*.ts", {
        cwd: directory,
        absolute: true,
    });
    const program = ts.createProgram({
        rootNames: typescriptFileNames,
        options: {
            noEmit: true,
            noImplicitAny: false,
            strict: true,
            noUncheckedIndexedAccess: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
        },
    });
    const emitResult = program.emit();
    const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    if (diagnostics.length > 0) {
        const errorMessage = [
            `Failed to compile generated code. View files here: ${directory}\n`,
            ...diagnostics.map((d) => `\t${getDiagnosticMessage(d)}`),
        ].join("\n");
        throw new Error(errorMessage);
    }
}

function getDiagnosticMessage(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        if (diagnostic.start != null) {
            const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
        } else {
            return `${diagnostic.file.fileName}: ${message}`;
        }
    } else {
        return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    }
}
