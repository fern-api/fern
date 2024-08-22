import { execSync } from "child_process";
import { BaseCsharpCustomConfigSchema } from "../../custom-config";
import { Writer } from "./Writer";

type Namespace = string;

export abstract class AstNode {
    /**
     * Every AST node knows how to write itself to a string.
     */
    public abstract write(writer: Writer): void;

    /**
     * Writes the node to a string.
     */
    public toString(
        namespace: string,
        allNamespaceSegments: Set<string>,
        allTypeClassReferences: Map<string, Set<Namespace>>,
        rootNamespace: string,
        customConfig: BaseCsharpCustomConfigSchema,
        format = false
    ): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        const stringNode = writer.toString();
        return format ? this.toFormattedSnippet(stringNode) : stringNode;
    }

    /**
     * function for formatting snippets, useful in testing
     */
    public toFormattedSnippet(code: string): string {
        code += ";";
        try {
            const finalCode = AstNode.formatCSharpCode(code);
            console.log("SUCCESS!");
            return finalCode;
        } catch (e: unknown) {
            console.log("FAILURE!");
            return code;
        }
    }

    private static formatCSharpCode(code: string): string {
        return execSync("dotnet csharpier", { input: code, encoding: "utf-8" });
    }
}
