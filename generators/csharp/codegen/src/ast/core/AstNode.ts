import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator"

import { BaseCsharpCustomConfigSchema } from "../../custom-config"
import { Writer } from "./Writer"

type Namespace = string

export interface FormattedAstNodeSnippet {
    imports: string | undefined
    body: string
}

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public toString({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        rootNamespace,
        customConfig,
        formatter,
        skipImports = false
    }: {
        namespace: string
        allNamespaceSegments: Set<string>
        allTypeClassReferences: Map<string, Set<Namespace>>
        rootNamespace: string
        customConfig: BaseCsharpCustomConfigSchema
        formatter?: AbstractFormatter
        skipImports?: boolean
    }): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig,
            skipImports
        })
        this.write(writer)
        const stringNode = writer.toString(skipImports)
        return formatter != null ? formatter.formatSync(stringNode) : stringNode
    }
    public toStringAsync({
        namespace,
        allNamespaceSegments,
        allTypeClassReferences,
        rootNamespace,
        customConfig,
        formatter,
        skipImports = false
    }: {
        namespace: string
        allNamespaceSegments: Set<string>
        allTypeClassReferences: Map<string, Set<Namespace>>
        rootNamespace: string
        customConfig: BaseCsharpCustomConfigSchema
        formatter?: AbstractFormatter
        skipImports?: boolean
    }): Promise<string> {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig,
            skipImports
        })
        this.write(writer)
        const stringNode = writer.toString(skipImports)
        return formatter != null ? formatter.format(stringNode) : Promise.resolve(stringNode)
    }

    public toFormattedSnippet({
        allNamespaceSegments,
        allTypeClassReferences,
        rootNamespace,
        customConfig,
        formatter,
        skipImports = false
    }: {
        allNamespaceSegments: Set<string>
        allTypeClassReferences: Map<string, Set<Namespace>>
        rootNamespace: string
        customConfig: BaseCsharpCustomConfigSchema
        formatter: AbstractFormatter
        skipImports: boolean
    }): FormattedAstNodeSnippet {
        const writer = new Writer({
            namespace: "",
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig,
            skipImports
        })
        this.write(writer)
        return {
            imports: writer.importsToString(),
            body: formatter.formatSync(writer.buffer)
        }
    }

    public async toFormattedSnippetAsync({
        allNamespaceSegments,
        allTypeClassReferences,
        rootNamespace,
        customConfig,
        formatter,
        skipImports = false
    }: {
        allNamespaceSegments: Set<string>
        allTypeClassReferences: Map<string, Set<Namespace>>
        rootNamespace: string
        customConfig: BaseCsharpCustomConfigSchema
        formatter: AbstractFormatter
        skipImports?: boolean
    }): Promise<FormattedAstNodeSnippet> {
        const writer = new Writer({
            namespace: "",
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig,
            skipImports
        })
        this.write(writer)
        return {
            imports: writer.importsToString(),
            body: await formatter.format(writer.buffer)
        }
    }
}
