import { AbstractWriter } from "@fern-api/generator-commons";
import { ClassReference } from "../ClassReference";

/* A dot-separated string representing the module path */
type ModulePath = string;

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    /* Import statements */
    private references: Record<ModulePath, ClassReference[]> = {};

    public toString(): string {
        const imports = this.stringifyImports();
        if (imports.length > 0) {
            return `\
${imports}
    
${this.buffer}`;
        }

        return this.buffer;
    }

    public addReference(reference: ClassReference): void {
        const modulePath = reference.getFullyQualifiedModulePath();
        this.references[modulePath] = (this.references[modulePath] ?? []).concat(reference);
    }

    /*******************************
     * Helper Methods
     *******************************/

    private stringifyImports(): string {
        return Object.entries(this.references)
            .filter(([modulePath]) => modulePath !== "")
            .map(([modulePath, references]) => {
                const uniqueClassNames = Array.from(new Set(references.map((r) => r.getName())));
                return `from ${modulePath} import ${uniqueClassNames.join(", ")}`;
            })
            .join("\n");
    }
}
