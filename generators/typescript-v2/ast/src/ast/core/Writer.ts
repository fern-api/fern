import { AbstractWriter } from "@fern-api/browser-compatible-base-generator";

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
                    this.validateDefault(reference);
                    break;
                }
                case "named": {
                    this.validateNamed(reference);
                    break;
                }
                case "star": {
                    this.validateStar(reference);
                    break;
                }
            }
            const moduleImports = (this.imports[reference.importFrom.moduleName] ??= []);
            const names = moduleImports.map((import_) => import_.name);
            if (!names.includes(reference.name)) {
                moduleImports.push(reference);
            }
        }
    }

    private validateDefault(reference: Reference): void {
        if (reference.importFrom?.type !== "default") {
            return;
        }
        const moduleDefault = (this.defaultImports[reference.importFrom.moduleName] ??= reference);
        if (moduleDefault.name !== reference.name) {
            throw new Error(
                `Cannot have multiple default imports for module ${reference.importFrom.moduleName}: ` +
                    `got ${reference.name} but already had ${moduleDefault.name}`
            );
        }
    }

    private validateNamed(reference: Reference): void {
        if (reference.importFrom?.type !== "named") {
            return;
        }

        const existing = this.imports[reference.importFrom.moduleName] ?? [];
        const existingStar = existing.filter((e) => e.importFrom?.type === "star");
        if (existingStar.length > 0) {
            throw new Error(
                `Cannot add named import ${reference.name} because non-named` +
                    ` imports ${existingStar.map((e) => e.name)} already exist`
            );
        }

        const duplicates = [];
        for (const references of Object.values(this.imports)) {
            for (const ref of references) {
                if (
                    ref.importFrom?.type === "named" &&
                    ref.importFrom.moduleName !== reference.importFrom.moduleName &&
                    ref.name === reference.name
                ) {
                    duplicates.push(ref);
                }
            }
        }
        // TODO: Need to be able to resolve conflicts instead of throwing
        if (duplicates.length > 0) {
            throw new Error(
                `Cannot add named import from module ${reference.importFrom.moduleName} ` +
                    `because it is already imported from ${duplicates[0]?.importFrom?.moduleName}`
            );
        }
    }

    private validateStar(reference: Reference): void {
        if (reference.importFrom?.type !== "star") {
            return;
        }

        const moduleAlias = (this.starImportAliases[reference.importFrom.moduleName] ??=
            reference.importFrom.starImportAlias);
        if (moduleAlias !== reference.importFrom.starImportAlias) {
            throw new Error(
                "Cannot have more than one alias for non-named imports from a module: " +
                    `got ${reference.importFrom.starImportAlias} but already have ${moduleAlias}.`
            );
        }

        const aliasModule = (this.starImportAliasesInverse[reference.importFrom.starImportAlias] ??=
            reference.importFrom.moduleName);
        // TODO: Need to be able to resolve conflicts instead of throwing
        if (aliasModule !== reference.importFrom.moduleName) {
            throw new Error(
                `Attempted to use alias ${reference.importFrom.starImportAlias} for more than one ` +
                    "module in the same file"
            );
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
