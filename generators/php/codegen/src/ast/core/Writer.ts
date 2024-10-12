import { AbstractWriter } from "@fern-api/generator-commons";
import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema";
import { classReference } from "../../php";
import { ClassReference } from "../ClassReference";
import { GLOBAL_NAMESPACE } from "./Constant";

type Namespace = string;

export declare namespace Writer {
    interface Args {
        /* The namespace that is being written to */
        namespace: string;
        /* The root namespace of the project */
        rootNamespace: string;
        /* Custom generator config */
        customConfig: BasePhpCustomConfigSchema;
        /* Import statements */
        references: Record<Namespace, ClassReference>;
    }
}

export class Writer extends AbstractWriter {
    /* The namespace that is being written to */
    public namespace: string;
    /* The root namespace of the project */
    public rootNamespace: string;
    /* Custom generator config */
    public customConfig: BasePhpCustomConfigSchema;
    /* Import statements */
    public readonly references: Record<Namespace, ClassReference> = {};
    public readonly namesWithConflicts = new Set<string>();

    constructor({ namespace, rootNamespace, customConfig, references }: Writer.Args) {
        super();
        this.namespace = namespace;
        this.rootNamespace = rootNamespace;
        this.customConfig = customConfig;
        this.references = references;
        this.namesWithConflicts = this.setConflictingNames(references);
    }

    private setConflictingNames(references: Record<Namespace, ClassReference>): Set<string> {
        const seenNames = new Set<string>();
        return new Set(
            Object.values(references)
                .filter((reference) => {
                    if (seenNames.has(reference.name)) {
                        return true;
                    }
                    seenNames.add(reference.name);
                    return false;
                })
                .map((classReference) => classReference.name)
        );
    }

    public addReference(reference: ClassReference): void {}

    public toString(): string {
        const namespace = `namespace ${this.namespace};`;
        const imports = this.stringifyImports();
        if (imports.length > 0) {
            return `${namespace}

${imports}

${this.buffer}`;
        }
        return namespace + "\n\n" + this.buffer;
    }

    public requiresInlineFullQualification(classReference: ClassReference) {
        return this.namesWithConflicts.has(classReference.name);
    }

    private stringifyImports(): string {
        const classReferences = Object.values(this.references).filter(
            (classReference) =>
                classReference.namespace !== this.namespace && !this.requiresInlineFullQualification(classReference)
        );
        if (classReferences.length === 0) {
            return "";
        }
        let result = classReferences.map((classReference) => `use ${this.toImportString(classReference)};`).join("\n");
        if (result.length > 0) {
            result += "\n";
        }
        return result;
    }

    public toImportString(reference: ClassReference): string {
        return reference.namespace === GLOBAL_NAMESPACE ? reference.name : `${reference.namespace}\\${reference.name}`;
    }
}
