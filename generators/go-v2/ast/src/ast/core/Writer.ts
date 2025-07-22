import { AbstractFormatter, AbstractWriter, NopFormatter } from "@fern-api/browser-compatible-base-generator";
import { basename } from "@fern-api/path-utils";

import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema";

type Alias = string;
type ImportPath = string;

// Regular expression to match invalid identifier characters
// according to Go conventions.
const INVALID_GO_IDENTIFIER_TOKEN = /[^0-9a-zA-Z_]/g;

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
        /* Formatter used to format Go source files */
        formatter?: AbstractFormatter;
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
    /* Formatter used to format Go source files */
    public formatter: AbstractFormatter;

    /* Import statements */
    protected imports: Record<ImportPath, Alias> = {};

    constructor({ packageName, rootImportPath, importPath, customConfig, formatter }: Writer.Args) {
        super();
        this.packageName = packageName;
        this.rootImportPath = rootImportPath;
        this.importPath = importPath;
        this.customConfig = customConfig;
        this.formatter = formatter ?? new NopFormatter();
    }

    /**
     * Adds the given import path to the rolling set, and returns the associated alias
     * that should be used to reference the package. If a conflict exists, we try to use
     * path components to create a unique alias, and only fall back to prepending '_'
     * as a last resort.
     */
    public addImport(importPath: string): string {
        const maybeAlias = this.imports[importPath];
        if (maybeAlias != null) {
            return maybeAlias;
        }
        const set = new Set<Alias>(Object.values(this.imports));
        const pathElements = importPath.split("/");

        // Try using progressively more path components to create a unique alias.
        for (let i = 1; i <= pathElements.length; i++) {
            const elements = pathElements.slice(-i);
            const alias = this.getValidAlias(elements.join(""));
            if (!set.has(alias)) {
                this.imports[importPath] = alias;
                return alias;
            }
        }

        // Fall back to prepending '_' until we find a unique alias.
        let alias = this.getValidAlias(basename(importPath));
        while (set.has(alias)) {
            alias = "_" + alias;
        }
        this.imports[importPath] = alias;
        return alias;
    }

    /**
     * Creates a new valid alias from the given string. Removes all
     * characters not included in the Go identifier grammar.
     *
     * This also removes any trailing '-' elements so the alias is as
     * terse as possible.
     */
    private getValidAlias(s: string): string {
        const split = s.split("-");
        if (split[0] == null) {
            return s;
        }
        return split[0].replace(INVALID_GO_IDENTIFIER_TOKEN, "");
    }
}
