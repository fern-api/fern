import { AbstractWriter } from "@fern-api/generator-commons";
import { Reference } from "../Reference";

type ModuleName = string;

export declare namespace Writer {
    interface Args {
        /* The name of the module that is being written to */
        moduleName: string;
    }
}

export class Writer extends AbstractWriter {
    protected imports: Record<ModuleName, Reference[]> = {};
    protected defaultImports: Record<ModuleName, Reference> = {};

    /**
     * Adds the given import under its module name.
     */
    public addImport(reference: Reference): void {
        if (reference.module != null) {
            if (reference.module.defaultExport ?? false) {
                const existing = this.defaultImports[reference.module.moduleName];
                if (existing == null) {
                    this.defaultImports[reference.module.moduleName] = reference;
                } else {
                    throw new Error(
                        `Cannot have multiple default imports for module ${reference.module.moduleName}: ` +
                            `got ${reference.name} but already had ${existing.name}`
                    );
                }
            }
            let moduleImports = this.imports[reference.module.moduleName];
            if (moduleImports == null) {
                this.imports[reference.module.moduleName] = [];
                moduleImports = this.imports[reference.module.moduleName];
            }
            if (moduleImports != null && !moduleImports.includes(reference)) {
                moduleImports.push(reference);
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
            const nonDefault = references.filter((r) => r !== defaultImport);
            if (nonDefault.length > 0 || defaultImport != null) {
                result += "import";
                if (defaultImport != null) {
                    result += ` ${defaultImport.name}`;
                }
                if (nonDefault.length > 0) {
                    for (const ref of nonDefault.slice(0, -1)) {
                        stringifiedNonDefault += `${ref.name}, `;
                    }
                    const lastRef = nonDefault[nonDefault.length - 1];
                    // Need for eslint; lastRef will not be null because length > 0
                    if (lastRef != null) {
                        stringifiedNonDefault += `${lastRef.name}`;
                    }
                    if (defaultImport != null) {
                        result += ",";
                    }
                    result += ` { ${stringifiedNonDefault} }`;
                }
                result += ` from "${module}";\n`;
            }
        }
        return result;
    }
}
