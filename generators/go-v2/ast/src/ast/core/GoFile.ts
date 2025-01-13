import { Writer } from "./Writer";

export declare namespace GoFile {
    interface Args extends Writer.Args {}
}

export class GoFile extends Writer {
    constructor({ packageName, rootImportPath, importPath, customConfig, formatter }: GoFile.Args) {
        super({ packageName, rootImportPath, importPath, customConfig, formatter });
    }

    public async toStringAsync(): Promise<string> {
        const content = this.getContent();
        if (this.formatter != null) {
            try {
                return this.formatter.format(content);
            } catch (error) {
                throw new Error(`Failed to format Go file: ${error}\n${content}`);
            }
        }
        return content;
    }

    public toString(): string {
        const content = this.getContent();
        if (this.formatter != null) {
            try {
                return this.formatter.formatSync(content);
            } catch (error) {
                throw new Error(`Failed to format Go file: ${error}\n${content}`);
            }
        }
        return content;
    }

    private getContent(): string {
        const packageStatement = `package ${this.packageName}\n\n`;
        const imports = this.stringifyImports();
        return imports.length > 0
            ? `${packageStatement}${imports}

${this.buffer}`
            : packageStatement + this.buffer;
    }

    private stringifyImports(): string {
        const result = Object.entries(this.imports)
            .filter(([importPath, _]) => importPath !== this.importPath) // Skip the target import path
            .map(([importPath, alias]) => `    ${alias} "${importPath}"`)
            .join("\n");

        return result ? `import (\n${result}\n)` : "";
    }
}
