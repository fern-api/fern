import { Writer } from "./Writer.js";

export declare namespace TypeScriptFile {
    interface Args extends Writer.Args {}
}

export class TypeScriptFile extends Writer {
    constructor({ customConfig, formatter }: TypeScriptFile.Args) {
        super({ customConfig, formatter });
    }

    public async toStringAsync({ omitImports }: { omitImports?: boolean } = {}): Promise<string> {
        const content = this.getContent({ omitImports });
        if (this.formatter != null) {
            try {
                return this.formatter.format(content);
            } catch (error) {
                throw new Error(`Failed to format TypeScript file: ${error}\n${content}`);
            }
        }
        return content;
    }

    public toString({ omitImports }: { omitImports?: boolean } = {}): string {
        const content = this.getContent({ omitImports });
        if (this.formatter != null) {
            try {
                return this.formatter.formatSync(content);
            } catch (error) {
                throw new Error(`Failed to format TypeScript file: ${error}\n${content}`);
            }
        }
        return content;
    }

    public getContent({ omitImports }: { omitImports?: boolean } = {}): string {
        if (omitImports) {
            return this.buffer;
        }
        const imports = this.stringifyImports();
        if (imports.length > 0) {
            return imports + "\n" + this.buffer;
        }
        return this.buffer;
    }

    /**
     * Whether anything written to this file references an import.
     */
    public hasImports(): boolean {
        return this.stringifyImports().length > 0;
    }

    /**
     * The rendered import block for everything written to this file, or an empty string when
     * nothing references an import. Does not include the trailing blank line the full file
     * output places between the imports and the body.
     */
    public getImports(): string {
        return this.stringifyImports().trimEnd();
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
