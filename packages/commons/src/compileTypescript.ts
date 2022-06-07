import glob from "glob-promise";
import ts, { CompilerOptions } from "typescript";

export async function compileTypescript(directory: string, options?: CompilerOptions): Promise<void> {
    const typescriptFileNames = await glob("**/*.ts", {
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
            esModuleInterop: true,
            ...options,
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
