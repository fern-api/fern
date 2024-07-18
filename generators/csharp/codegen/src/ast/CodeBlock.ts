import { execSync } from "child_process";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace CodeBlock {
    /* Write arbitrary code */
    type Arg = string | ((writer: Writer) => void);
}

export class CodeBlock extends AstNode {
    private value: string | ((writer: Writer) => void);

    constructor(value: CodeBlock.Arg) {
        super();
        this.value = value;
    }

    public write(writer: Writer): void {
        if (typeof this.value === "string") {
            writer.write(this.value);
        } else {
            this.value(writer);
        }
    }

    /**
     * function for formatting snippets, useful in testing
     */
    public toFormattedSnippet(addSemiColon = true): string {
        let codeString = this.toString();
        if (addSemiColon) {
            codeString += ";";
        }
        try {
            return CodeBlock.formatCSharpCode(codeString);
        } catch (e: unknown) {
            return codeString;
        }
    }

    private static formatCSharpCode(code: string): string {
        return execSync("dotnet csharpier", { input: code, encoding: "utf-8" });
    }
}
