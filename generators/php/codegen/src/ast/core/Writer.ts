import { AbstractWriter } from "@fern-api/base-generator";

import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema";
import { ClassReference } from "../ClassReference";
import { GLOBAL_NAMESPACE } from "./Constant";

/* A fully qualified type name _without_ the initial backslash */
type FullyQualifiedName = string;

interface ParsedFullyQualifiedName {
    namespace: string;
    name: string;
}

function parseFullyQualifiedName(rawFullyQualifiedName: string): ParsedFullyQualifiedName {
    return {
        namespace: rawFullyQualifiedName.substring(0, rawFullyQualifiedName.lastIndexOf("\\")),
        name: rawFullyQualifiedName.substring(rawFullyQualifiedName.lastIndexOf("\\") + 1)
    };
}

export declare namespace Writer {
    interface Args {
        /* The namespace that is being written to */
        namespace: string;
        /* The root namespace of the project */
        rootNamespace: string;
        /* Custom generator config */
        customConfig: BasePhpCustomConfigSchema;
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
    private references: Record<FullyQualifiedName, ClassReference[]> = {};

    constructor({ namespace, rootNamespace, customConfig }: Writer.Args) {
        super();
        this.namespace = namespace;
        this.rootNamespace = rootNamespace;
        this.customConfig = customConfig;
    }

    public addReference(reference: ClassReference): void {
        if (reference.namespace == null) {
            return;
        }

        // If there's a naming conflict, tell the reference to use its qualified name
        const conflictingReferences = Object.keys(this.references)
            // Filter out the current namespace.
            .filter((seenRef) => {
                const parsed = parseFullyQualifiedName(seenRef);
                return parsed.namespace !== reference.namespace && parsed.name === reference.name;
            });

        if (conflictingReferences.length > 0) {
            reference.requireFullyQualified();
            return;
        }

        const fullyQualifiedName =
            reference.namespace === GLOBAL_NAMESPACE ? reference.name : `${reference.namespace}\\${reference.name}`;
        const references = (this.references[fullyQualifiedName] ??= []);

        references.push(reference);
    }

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

    private stringifyImports(): string {
        const referenceKeys = Object.keys(this.references);
        if (referenceKeys.length === 0) {
            return "";
        }
        let result = referenceKeys
            // Filter out the current namespace.
            .filter((reference) => parseFullyQualifiedName(reference).namespace !== this.namespace)
            .map((ref) => `use ${ref};`)
            .join("\n");

        if (result.length > 0) {
            result += "\n";
        }
        return result;
    }
}
