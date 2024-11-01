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

    /**
     * Adds the given import under its module name.
     */
    public addImport(reference: Reference): void {
        if (reference.module != null) {
            switch (reference.module.importType) {
                case "default": {
                    const existing = this.defaultImports[reference.module.moduleName];
                    if (existing == null) {
                        this.defaultImports[reference.module.moduleName] = reference;
                    } else if (existing.name !== reference.name) {
                        throw new Error(
                            `Cannot have multiple default imports for module ${reference.module.moduleName}: ` +
                                `got ${reference.name} but already had ${existing.name}`
                        );
                    }
                    break;
                }
                case "named": {
                    const existing = this.imports[reference.module.moduleName];
                    if (existing != null) {
                        const existingStar = existing.filter((e) => e.module?.importType === "star");
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
                    const existing = this.imports[reference.module.moduleName];
                    if (existing != null) {
                        const existingNamed = existing.filter((e) => e.module?.importType === "named");
                        if (existingNamed.length > 0) {
                            throw new Error(
                                `Cannot add non-named import ${reference.name} because named` +
                                    ` imports ${existingNamed.map((e) => e.name)} already exist`
                            );
                        }
                        const existingAlias = this.starImportAliases[reference.module.moduleName];
                        if (existingAlias == null && reference.module.starImportAlias != null) {
                            this.starImportAliases[reference.module.moduleName] = reference.module.starImportAlias;
                        } else if (existingAlias != null && existingAlias !== reference.module.starImportAlias) {
                            throw new Error(
                                "Cannot have more than one alias for non-named imports from a module: " +
                                    `got ${reference.module.starImportAlias} but already have ${existingAlias}.`
                            );
                        }
                    }
                    break;
                }
            }
            this.imports[reference.module.moduleName] ??= [];
            const moduleImports = this.imports[reference.module.moduleName];
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
            const named = references.filter((r) => r.module?.importType === "named");
            const starImports = references.filter((r) => r.module?.importType === "star");
            if (named.length > 0 || defaultImport != null || starImports.length > 0) {
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
                if (starImports.length > 0) {
                    const alias = starImports[0]?.module?.starImportAlias;
                    if (alias != null) {
                        if (defaultImport != null || named.length > 0) {
                            result += ", ";
                        }
                        result += ` * as ${alias}`;
                    }
                }
                result += ` from "${module}";\n`;
            }
        }
        return result;
    }
}
