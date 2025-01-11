import { AbstractWriter } from "@fern-api/base-generator";

import { ClassReference } from "..";
import { csharp } from "../..";
import { BaseCsharpCustomConfigSchema } from "../../custom-config";
import { AstNode } from "./AstNode";
import { DocXmlWriter } from "./DocXmlWriter";

type Alias = string;
type Namespace = string;

export declare namespace Writer {
    interface Args {
        /* The namespace that is being written to */
        namespace: string;
        /* All base namespaces in the project */
        allNamespaceSegments: Set<string>;
        /* The name of every type in the project mapped to the namespaces a type of that name belongs to */
        allTypeClassReferences: Map<string, Set<Namespace>>;
        /* The root namespace of the project */
        rootNamespace: string;
        /* Custom generator config */
        customConfig: BaseCsharpCustomConfigSchema;
    }
}

export class Writer extends AbstractWriter {
    /* Import statements */
    private references: Record<Namespace, ClassReference[]> = {};
    /* The namespace that is being written to */
    private namespace: string;
    /* The set of namespace aliases */
    private namespaceAliases: Record<Alias, Namespace> = {};
    /* All base namespaces in the project */
    private allNamespaceSegments: Set<string>;
    /* The name of every type in the project mapped to the namespaces a type of that name belongs to */
    private allTypeClassReferences: Map<string, Set<Namespace>>;
    /* The root namespace of the project */
    private rootNamespace: string;
    /* Whether or not dictionary<string, object?> should be simplified to just objects */
    private customConfig: BaseCsharpCustomConfigSchema;

    constructor({ namespace, allNamespaceSegments, allTypeClassReferences, rootNamespace, customConfig }: Writer.Args) {
        super();
        this.namespace = namespace;
        this.allNamespaceSegments = allNamespaceSegments;
        this.allTypeClassReferences = allTypeClassReferences;
        this.rootNamespace = rootNamespace;
        this.customConfig = customConfig;
    }

    public addReference(reference: ClassReference): void {
        if (reference.namespace == null) {
            return;
        }
        const namespace = this.references[reference.namespace];
        if (namespace != null) {
            namespace.push(reference);
        } else {
            this.references[reference.namespace] = [reference];
        }
    }

    public addNamespace(namespace: string): void {
        const foundNamespace = this.references[namespace];
        if (foundNamespace == null) {
            this.references[namespace] = [];
        }
    }

    public addNamespaceAlias(alias: string, namespace: string): void {
        this.namespaceAliases[alias] = namespace;
    }

    public getAllTypeClassReferences(): Map<string, Set<Namespace>> {
        return this.allTypeClassReferences;
    }

    public getAllNamespaceSegments(): Set<string> {
        return this.allNamespaceSegments;
    }

    public getRootNamespace(): string {
        return this.rootNamespace;
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public getCustomConfig(): BaseCsharpCustomConfigSchema {
        return this.customConfig;
    }

    public getSimplifyObjectDictionaries(): boolean {
        return this.customConfig["simplify-object-dictionaries"] ?? true;
    }

    public toString(skipImports = false): string {
        if (!skipImports) {
            const imports = this.stringifyImports();
            if (imports.length > 0) {
                return `${imports}
    #nullable enable

    ${this.buffer}`;
            }
        }
        return this.buffer;
    }

    public importsToString(): string | undefined {
        const imports = this.stringifyImports();
        return imports.length > 0 ? imports : undefined;
    }

    public isReadOnlyMemoryType(type: string): boolean {
        return this.customConfig["read-only-memory-types"]?.includes(type) ?? false;
    }

    /*******************************
     * Helper Methods
     *******************************/

    private stringifyImports(): string {
        const referenceKeys = Object.keys(this.references);
        const namespaceAliasEntries = Object.entries(this.namespaceAliases);
        if (referenceKeys.length === 0 && namespaceAliasEntries.length === 0) {
            return "";
        }

        let result = referenceKeys
            // Filter out the current namespace.
            .filter((referenceNamespace) => referenceNamespace !== this.namespace)
            .map((ref) => `using ${ref};`)
            .join("\n");

        if (result.length > 0) {
            result += "\n";
        }

        for (const [alias, namespace] of namespaceAliasEntries) {
            result += `using ${alias} = ${namespace};\n`;
        }

        return result;
    }
}
