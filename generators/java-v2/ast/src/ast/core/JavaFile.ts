import { Writer } from "./Writer";

export declare namespace JavaFile {
    interface Args extends Writer.Args {}
}

export class JavaFile extends Writer {
    constructor({ packageName, customConfig, formatter }: JavaFile.Args) {
        super({ packageName, customConfig, formatter });
    }

    public async toStringAsync(): Promise<string> {
        const content = this.getContent();
        if (this.formatter != null) {
            try {
                return this.formatter.format(content);
            } catch (error) {
                throw new Error(`Failed to format Java file: ${error}\n${content}`);
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
                throw new Error(`Failed to format Java file: ${error}\n${content}`);
            }
        }
        return content;
    }

    private getContent(): string {
        const packageStatement = `package ${this.packageName};\n\n`;
        const imports = this.stringifyImports();
        return imports.length > 0
            ? `${packageStatement}${imports}

${this.buffer}`
            : packageStatement + this.buffer;
    }

    private stringifyImports(): string {
        return Array.from(this.imports)
            .filter((packageName) => packageName !== this.packageName) // Skip the target package
            .map((packageName) => `import ${packageName};`)
            .sort()
            .join("\n");
    }
}
