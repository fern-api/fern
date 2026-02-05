import { AbstractWriter } from "@fern-api/browser-compatible-base-generator";
import { Generation } from "../../context/generation-info";
import { type ClassReference } from "../types/ClassReference";

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
        /* Custom generator config */
        generation: Generation;
        /* Whether or not to skip writing imports */
        skipImports?: boolean;
    }
}

export class Writer extends AbstractWriter {
    /* Import statements */
    private references: Record<Namespace, ClassReference[]> = {};
    /* The namespace that is being written to */
    public namespace: string;
    /* The set of namespace aliases */
    private namespaceAliases: Record<Alias, Namespace> = {};
    /* All base namespaces in the project */
    private allNamespaceSegments: Set<string>;
    /* The name of every type in the project mapped to the namespaces a type of that name belongs to */
    private allTypeClassReferences: Map<string, Set<Namespace>>;
    /* Whether or not dictionary<string, object?> should be simplified to just objects */
    public readonly generation: Generation;
    /* Whether or not to skip writing imports */
    public readonly skipImports: boolean;

    constructor({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        skipImports = false
    }: Writer.Args) {
        super();
        this.namespace = namespace;
        this.allNamespaceSegments = allNamespaceSegments;
        this.allTypeClassReferences = allTypeClassReferences;
        this.generation = generation;
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
            alias = `_${alias}`;
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

    public override toString(skipImports = false): string {
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
        return this.generation.settings.readOnlyMemoryTypes.includes(type);
    }

    private inQuoteBlock = false;

    public override shouldSkipTracking(lines: string[]) {
        lines.forEach((line) => (this.inQuoteBlock = line.includes('"""') ? !this.inQuoteBlock : this.inQuoteBlock));
        return this.inQuoteBlock;
    }

    /*******************************
     * Helper Methods
     *******************************/

    private stringifyImports(): string {
        let result = Object.entries(this.references)
            .filter(
                ([ns]) =>
                    ns && // filter out blank or unspecified namespaces
                    !this.isCurrentNamespace(ns) && // filter out the current namespace.
                    !this.generation.registry.isNamespaceImplicit(ns) // filter out implicitly imported namespaces.
            )
            .map(
                ([, refs]) =>
                    `using ${refs.some((ref) => ref?.global) ? "global::" : ""}${(refs[0] as ClassReference).resolveNamespace()};`
            )
            .join("\n");

        if (result.length > 0) {
            result = `${result}\n`;
        }

        for (const [alias, namespace] of Object.entries(this.namespaceAliases)) {
            result = `${result}using ${alias} = ${namespace};\n`;
        }

        return result;
    }

    private isCurrentNamespace(namespace: string): boolean {
        return namespace === this.namespace;
    }
}
