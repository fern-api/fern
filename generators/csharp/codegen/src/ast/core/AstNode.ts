import { execSync } from "child_process";

import { AbstractAstNode } from "@fern-api/base-generator";

import { BaseCsharpCustomConfigSchema } from "../../custom-config";
import { Writer } from "./Writer";

type Namespace = string;

export interface FormattedAstNodeSnippet {
    imports: string | undefined;
    body: string;
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
        format = false,
        skipImports = false
    }: {
        namespace: string;
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        rootNamespace: string;
        customConfig: BaseCsharpCustomConfigSchema;
        format?: boolean;
        skipImports?: boolean;
    }): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        const stringNode = writer.toString(skipImports);
        return format ? AstNode.toFormattedSnippet(stringNode) : stringNode;
    }

    public toFormattedSnippet({
        allNamespaceSegments,
        allTypeClassReferences,
        rootNamespace,
        customConfig
    }: {
        allNamespaceSegments: Set<string>;
        allTypeClassReferences: Map<string, Set<Namespace>>;
        rootNamespace: string;
        customConfig: BaseCsharpCustomConfigSchema;
    }): FormattedAstNodeSnippet {
        const writer = new Writer({
            namespace: "",
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        return {
            imports: writer.importsToString(),
            body: AstNode.toFormattedSnippet(writer.buffer)
        };
    }

    /**
     * function for formatting snippets, useful in testing
     */
    private static toFormattedSnippet(code: string): string {
        code += ";";
        try {
            const finalCode = AstNode.formatCSharpCode(code);
            return finalCode;
        } catch (e: unknown) {
            return code;
        }
    }

    private static formatCSharpCode(code: string): string {
        return execSync("dotnet csharpier", { input: code, encoding: "utf-8" });
    }
}
