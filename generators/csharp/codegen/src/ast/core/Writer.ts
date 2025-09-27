import { AbstractWriter } from "@fern-api/browser-compatible-base-generator";
import { BaseCsharpCustomConfigSchema } from "../../custom-config";
import { type ClassReference } from "../ClassReference";

type Alias = string;
type Namespace = string;

const IMPLICIT_NAMESPACES = new Set(["System"]);

function isNamespaceImplicit(namespace: string): boolean {
    return IMPLICIT_NAMESPACES.has(namespace);
}

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
        /* Whether or not to skip writing imports */
        skipImports?: boolean;
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

    /* Whether or not to skip writing imports */
    public readonly skipImports: boolean;

    constructor({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        rootNamespace,
        customConfig,
        skipImports = false
    }: Writer.Args) {
        super();
        this.namespace = namespace;
        this.allNamespaceSegments = allNamespaceSegments;
        this.allTypeClassReferences = allTypeClassReferences;
        this.rootNamespace = rootNamespace;
        this.customConfig = customConfig;
        this.skipImports = skipImports;
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

    public addNamespaceAlias(alias: string, namespace: string): string {
        const set = new Set<Alias>(Object.values(this.namespaceAliases));
        while (set.has(alias)) {
            alias = "_" + alias;
        }
        this.namespaceAliases[alias] = namespace;
        return alias;
    }

    public getReferencedNamespaces(): string[] {
        return Object.keys(this.references);
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

    public get useFullyQualifiedNamespaces(): boolean {
        return this.customConfig["experimental-fully-qualified-namespaces"] ?? false;
    }

    public getSimplifyObjectDictionaries(): boolean {
        return this.customConfig["simplify-object-dictionaries"] ?? false;
    }

    public toString(skipImports = false): string {
        if (!skipImports) {
            const imports = this.stringifyImports();
            if (imports.length > 0) {
                return `${imports}
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
        let result = Object.entries(this.references)
            .filter(([ns]) => !this.isCurrentNamespace(ns)) // Filter out the current namespace.
            .filter(([ns]) => !isNamespaceImplicit(ns)) // System is implicitly imported
            .map(
                ([, refs]) =>
                    `using ${refs.some((ref) => ref?.global) ? "global::" : ""}${(refs[0] as ClassReference).resolveNamespace()};`
            )
            .join("\n");

        if (result.length > 0) {
            result += "\n";
        }

        for (const [alias, namespace] of Object.entries(this.namespaceAliases)) {
            result += `using ${alias} = ${namespace};\n`;
        }

        return result;
    }

    private isCurrentNamespace(namespace: string): boolean {
        return namespace === this.namespace;
    }
}
