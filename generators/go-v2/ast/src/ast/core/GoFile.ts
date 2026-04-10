import { Writer } from "./Writer.js";

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
        const entries = Object.entries(this.imports).filter(
            ([importPath, _]) => importPath !== this.importPath // Skip the target import path
        );

        if (entries.length === 0) {
            return "";
        }

        // Separate stdlib imports from third-party imports.
        // Stdlib import paths do not contain a dot in the first path segment (e.g., "fmt", "net/http").
        const stdlibImports: [string, string][] = [];
        const thirdPartyImports: [string, string][] = [];
        for (const entry of entries) {
            const firstSegment = entry[0].split("/")[0] ?? "";
            if (firstSegment.includes(".")) {
                thirdPartyImports.push(entry);
            } else {
                stdlibImports.push(entry);
            }
        }

        const sortEntries = (a: [string, string], b: [string, string]): number =>
            a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
        stdlibImports.sort(sortEntries);
        thirdPartyImports.sort(sortEntries);

        const formatEntry = ([importPath, alias]: [string, string]): string => `    ${alias} "${importPath}"`;

        const groups: string[] = [];
        if (stdlibImports.length > 0) {
            groups.push(stdlibImports.map(formatEntry).join("\n"));
        }
        if (thirdPartyImports.length > 0) {
            groups.push(thirdPartyImports.map(formatEntry).join("\n"));
        }

        return `import (\n${groups.join("\n\n")}\n)`;
    }
}
