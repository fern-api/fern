import { Writer } from "./Writer";

export declare namespace TypeScriptFile {
    interface Args extends Writer.Args {}
}

export class TypeScriptFile extends Writer {
    constructor({ customConfig, formatter }: TypeScriptFile.Args) {
        super({ customConfig, formatter });
    }

    public async toStringAsync(): Promise<string> {
        const content = this.getContent();
        if (this.formatter != null) {
            try {
                return this.formatter.format(content);
            } catch (error) {
                throw new Error(`Failed to format TypeScript file: ${error}\n${content}`);
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
                throw new Error(`Failed to format TypeScript file: ${error}\n${content}`);
            }
        }
        return content;
    }

    public getContent(): string {
        const imports = this.stringifyImports();
        if (imports.length > 0) {
            return imports + "\n" + this.buffer;
        }
        return this.buffer;
    }

    private stringifyImports(): string {
        let result = "";
        for (const [module, references] of Object.entries(this.imports)) {
            const defaultImport = this.defaultImports[module];
            let stringifiedNonDefault = "";
            const named = references.filter((r) => r.importFrom?.type === "named");
            const starImportAlias = this.starImportAliases[module];
            if (named.length > 0 || defaultImport != null || starImportAlias != null) {
                result += "import";
                if (defaultImport != null) {
                    result += ` ${defaultImport.name}`;
                }
                if (named.length > 0) {
                    for (const ref of named.slice(0, -1)) {
                        stringifiedNonDefault += `${ref.name}, `;
                    }
                    const lastRef = named[named.length - 1];
                    // Need for eslint; lastRef will not be null because length > 0
                    if (lastRef != null) {
                        stringifiedNonDefault += `${lastRef.name}`;
                    }
                    if (defaultImport != null) {
                        result += ",";
                    }
                    result += ` { ${stringifiedNonDefault} }`;
                }
                if (starImportAlias != null) {
                    if (defaultImport != null || named.length > 0) {
                        result += ", ";
                    }
                    result += ` * as ${starImportAlias}`;
                }
                result += ` from "${module}";\n`;
            }
        }
        return result;
    }
}
