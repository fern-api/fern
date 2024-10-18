import { AbstractWriter } from "@fern-api/generator-commons";
import { Interface } from "./Interface";
import { Namespace } from "./Namespace";
import { Reference } from "./Reference";
import * as prettier from "prettier";

export class Writer extends AbstractWriter {
    private filepath: string | undefined;
    /* Import statements */
    private references: Reference[] = [];
    /* Set to true, if within a declared namespace */
    private ambient: boolean = false;
    /**
     * The ordered elements inside of a namespace
     */
    private elements: (Interface | Namespace)[] = [];

    public constructor(filepath?: string) {
        super();
        this.filepath = filepath;
    }

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

    public startAmbient(): void {
        this.ambient = true;
    }

    public stopAmbient(): void {
        this.ambient = false;
    }

    public isAmbient(): boolean {
        return this.ambient;
    }

    public toString(skipImports = false): string {
        for (const element of this.elements) {
            this.writeNode(element);
            this.writeLine();
            this.writeLine();
        }

        let rootModuleAdded = false;

        const modules: Set<string> = new Set();
        const imports: string[] = [];

        const addUniqueImport = (import_: string, module?: string) => {
            if (module != null && modules.has(module)) {
                return;
            }
            if (imports.includes(import_)) {
                return;
            }
            imports.push(import_);
        };
        if (!skipImports) {
            for (const reference of this.references) {
                switch (reference.args.type) {
                    case "module":
                        addUniqueImport(
                            `import * as ${reference.args.module} from "${reference.args.source}";`,
                            reference.args.module
                        );
                        break;
                    case "named":
                        addUniqueImport(`import { ${reference.args.name}} from "${reference.args.source}";`);
                        break;
                    case "root": {
                        if (!rootModuleAdded && this.filepath != null) {
                            addUniqueImport(
                                `import * as ${reference.args.module} from "${this.filepath
                                    .split("/")
                                    .map(() => "../")
                                    .join("")}index";`,
                                reference.args.module
                            );
                        }
                    }
                }
            }
        }
        return `${imports.join("\n")}\n\n${this.buffer}`;
    }

    public toStringFormatted(): string {
        return prettier.format(this.toString(), { parser: "typescript", tabWidth: 4, printWidth: 120 });
    }
}
