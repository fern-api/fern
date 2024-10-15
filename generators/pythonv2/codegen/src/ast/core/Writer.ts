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
            this.write(imports);
            this.write("\n");
        }

        return this.buffer;
    }

    public addReference(reference: ClassReference): void {
        const modulePath = reference.getFullQualifiedModulePath();
        this.references[modulePath] = (this.references[modulePath] ?? []).concat(reference);
    }

    /*******************************
     * Helper Methods
     *******************************/

    private stringifyImports(): string {
        return Object.entries(this.references)
            .map(([modulePath, references]) => {
                return `from ${modulePath} import ${references.map((r) => r.getName()).join(", ")}`;
            })
            .join("\n");
    }
}
