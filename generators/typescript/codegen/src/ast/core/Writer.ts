import { AbstractWriter } from "@fern-api/generator-commons";
import { Reference } from "../Reference";

export class Writer extends AbstractWriter {
    /* Import statements */
    private references: Reference[] = [];
    /* Set to true, if within a declared namespace */
    public isAmbient: boolean = false;

    public addReference(reference: Reference): void {
        this.references.push(reference);
    }

    public setAmbient(isAmbient: boolean): void {
        this.isAmbient = isAmbient;
    }

    public toString(skipImports = false): string {
        const imports: string[] = [];
        if (!skipImports) {
            for (const reference of this.references) {
                switch (reference.args.type) {
                    case "module":
                        imports.push(`import * as ${reference.args.module} from "${reference.args.source}";`);
                        break;
                    case "named":
                        imports.push(`import { ${reference.args.name}} from "${reference.args.source}";`);
                        break;
                }
            }
        }
        return `${imports.join("\n")}\n\n${this.buffer}`;
    }
}
