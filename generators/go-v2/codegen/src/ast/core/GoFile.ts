import { Writer } from "./Writer";

export declare namespace GoFile {
    interface Args extends Writer.Args {}
}

export class GoFile extends Writer {
    constructor({ packageName, rootImportPath, importPath, customConfig, formatter }: GoFile.Args) {
        super({ packageName, rootImportPath, importPath, customConfig, formatter });
    }

    public async toString(): Promise<string> {
        const packageStatement = `package ${this.packageName}\n\n`;
        const imports = this.stringifyImports();
        const content =
            imports.length > 0
                ? `${packageStatement}${imports}

${this.buffer}`
                : packageStatement + this.buffer;

        if (this.formatter != null) {
            try {
                return this.formatter.format(content);
            } catch (error) {
                throw new Error(`Failed to format Go file: ${error}\n${content}`);
            }
        }
        return content;
    }

    private stringifyImports(): string {
        const result = Object.entries(this.imports)
            .filter(([importPath, _]) => importPath !== this.importPath) // Skip the target import path
            .map(([importPath, alias]) => `    ${alias} "${importPath}"`)
            .join("\n");

        return result ? `import (\n${result}\n)` : "";
    }
}
