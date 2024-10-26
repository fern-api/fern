import { Writer } from "./Writer";
import init, { format } from "@wasm-fmt/gofmt";

export declare namespace GoFile {
    interface Args extends Writer.Args {}
}

export class GoFile extends Writer {
    constructor({ packageName, rootImportPath, importPath, customConfig }: GoFile.Args) {
        super({ packageName, rootImportPath, importPath, customConfig });
    }

    public async toString(): Promise<string> {
        const packageStatement = `package ${this.packageName}\n\n`;
        const imports = this.stringifyImports();
        const content =
            imports.length > 0
                ? `${packageStatement}${imports}

${this.buffer}`
                : packageStatement + this.buffer;

        await init();
        try {
            return format(content);
        } catch (error) {
            throw new Error(`Failed to format Go file: ${error}\n${content}`);
        }
    }

    private stringifyImports(): string {
        const result = Object.entries(this.imports)
            .filter(([importPath, _]) => importPath !== this.importPath) // Skip the target import path
            .map(([importPath, alias]) => `    ${alias} "${importPath}"`)
            .join("\n");

        return result ? `import (\n${result}\n)` : "";
    }
}
