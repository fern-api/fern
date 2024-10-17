import { AbstractWriter } from "@fern-api/generator-commons";
import { Interface } from "./Interface";
import { Namespace } from "./Namespace";
import { Reference } from "./Reference";
import * as prettier from "prettier";

export class Writer extends AbstractWriter {
    /* Import statements */
    private references: Reference[] = [];

    /* Set to true, if within a declared namespace */
    public isAmbient: boolean = false;

    /**
     * The ordered elements inside of a namespace
     */
    private elements: (Interface | Namespace)[] = [];

    /**
     * Add a namespace to the relevant file
     * @param interface_
     */
    public addNamespace(interface_: Namespace): void {
        this.elements.push(interface_);
    }

    /**
     * Add an interface to the relevant file
     * @param interface_
     */
    public addInterface(interface_: Interface): void {
        this.elements.push(interface_);
    }

    /**
     * Used to automatically create imports
     * @param reference A Reference to a TypeScript Element
     */
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

    public toStringFormatted(): string {
        return prettier.format(this.toString(), { parser: "typescript", tabWidth: 4, printWidth: 120 });
    }
}
