import { AbstractWriter } from "@fern-api/generator-commons";
import { Reference } from "../Reference";

type ModuleName = string;
type Alias = string;

export declare namespace Writer {
    interface Args {
        /* The name of the module that is being written to */
        moduleName: string;
    }
}

export class Writer extends AbstractWriter {
    protected imports: Record<ModuleName, Reference[]> = {};
    protected defaultImports: Record<ModuleName, Reference> = {};
    protected starImportAliases: Record<ModuleName, Alias> = {};
    protected starImportAliasesInverse: Record<Alias, ModuleName> = {};

    /**
     * Adds the given import under its module name.
     */
    public addImport(reference: Reference): void {
        if (reference.importFrom != null) {
            switch (reference.importFrom.type) {
                case "default": {
                    const existing = this.defaultImports[reference.importFrom.moduleName];
                    if (existing == null) {
                        this.defaultImports[reference.importFrom.moduleName] = reference;
                    } else if (existing.name !== reference.name) {
                        throw new Error(
                            `Cannot have multiple default imports for module ${reference.importFrom.moduleName}: ` +
                                `got ${reference.name} but already had ${existing.name}`
                        );
                    }
                    break;
                }
                case "named": {
                    const existing = this.imports[reference.importFrom.moduleName];
                    if (existing != null) {
                        const existingStar = existing.filter((e) => e.importFrom?.type === "star");
                        if (existingStar.length > 0) {
                            throw new Error(
                                `Cannot add named import ${reference.name} because non-named` +
                                    ` imports ${existingStar.map((e) => e.name)} already exist`
                            );
                        }
                    }
                    break;
                }
                case "star": {
                    const existing = this.imports[reference.importFrom.moduleName];
                    if (existing != null) {
                        const existingNamed = existing.filter((e) => e.importFrom?.type === "named");
                        if (existingNamed.length > 0) {
                            throw new Error(
                                `Cannot add non-named import ${reference.name} because named` +
                                    ` imports ${existingNamed.map((e) => e.name)} already exist`
                            );
                        }
                        const moduleForAlias = this.starImportAliasesInverse[reference.importFrom.starImportAlias];
                        if (moduleForAlias != null && moduleForAlias !== reference.importFrom.moduleName) {
                            throw new Error(
                                `Attempted to use alias ${reference.importFrom.starImportAlias} for more than one ` +
                                    "module in the same file"
                            );
                        }
                        const existingAlias = this.starImportAliases[reference.importFrom.moduleName];
                        if (existingAlias == null) {
                            this.starImportAliases[reference.importFrom.moduleName] =
                                reference.importFrom.starImportAlias;
                            this.starImportAliasesInverse[reference.importFrom.starImportAlias] =
                                reference.importFrom.moduleName;
                        } else if (existingAlias != null && existingAlias !== reference.importFrom.starImportAlias) {
                            throw new Error(
                                "Cannot have more than one alias for non-named imports from a module: " +
                                    `got ${reference.importFrom.starImportAlias} but already have ${existingAlias}.`
                            );
                        }
                    }
                    break;
                }
            }
            this.imports[reference.importFrom.moduleName] ??= [];
            const moduleImports = this.imports[reference.importFrom.moduleName];
            if (moduleImports != null) {
                const names = moduleImports.map((import_) => import_.name);
                if (!names.includes(reference.name)) {
                    moduleImports.push(reference);
                }
            }
        }
    }

    public toString(): string {
        return this.stringifyImports() + this.buffer;
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
