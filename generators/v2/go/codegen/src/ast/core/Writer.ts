import { AbstractWriter } from "@fern-api/generator-commons";
import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema";
import path from "path";

type Alias = string;
type ImportPath = string;

export declare namespace Writer {
    interface Args {
        /* The package name that is being written to */
        packageName: string;
        /* The root import path that is being written to */
        rootImportPath: string;
        /* The import path that is being written to */
        importPath: string;
        /* Custom generator config */
        customConfig: BaseGoCustomConfigSchema;
    }
}

export class Writer extends AbstractWriter {
    /* The package name that is being written to */
    public packageName: string;
    /* The root import path that is being written to */
    public rootImportPath: string;
    /* The import path that is being written to */
    public importPath: string;
    /* Custom generator config */
    public customConfig: BaseGoCustomConfigSchema;

    /* Import statements */
    private imports: Record<ImportPath, Alias> = {};

    constructor({ packageName, rootImportPath, importPath, customConfig }: Writer.Args) {
        super();
        this.packageName = packageName;
        this.rootImportPath = rootImportPath;
        this.importPath = importPath;
        this.customConfig = customConfig;
    }

    /**
     * Adds the given import path to the rolling set, and returns the associated alias
     * that should be used to reference the package. If a conflict exists, we prepend a
     * prefix to the alias until we find a unique one.
     */
    public addImport(importPath: string): string {
        const maybeAlias = this.imports[importPath];
        if (maybeAlias != null) {
            return maybeAlias;
        }
        let alias = path.basename(importPath);
        while (alias in this.imports) {
            alias = "_" + alias;
        }
        this.imports[importPath] = alias;
        return alias;
    }

    public toString({ snippet }: { snippet?: boolean }): string {
        const packageStatement = !snippet ? `package ${this.packageName};\n\n` : "";
        const imports = this.stringifyImports();
        if (imports.length > 0) {
            return `${packageStatement}${imports}

${this.buffer}`;
        }
        return packageStatement + this.buffer;
    }

    private stringifyImports(): string {
        const result = Object.entries(this.imports)
            .filter(([importPath, _]) => importPath !== this.importPath) // Skip the target import path
            .map(([importPath, alias]) => `    ${alias} "${importPath}"`)
            .join("\n");

        return result ? `import (\n${result}\n)` : "";
    }
}
