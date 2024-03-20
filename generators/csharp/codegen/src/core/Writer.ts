import { ClassReference } from "../ast";
import { AstNode } from "./AstNode";

type Namespace = string;

const TAB_SIZE = 4;

export declare namespace Writer {
    interface Args {
        /* The namespace that is being written to */
        namespace?: string;
    }
}

export class Writer {
    /* The contents being written */
    private buffer = "";
    /* Indentation level (multiple of 4) */
    private indentLevel = 0;
    /* Whether anything has been written to the buffer */
    private hasWrittenAnything = false;
    /* Whether the last character written was a newline */
    private lastCharacterIsNewline = false;
    /* The current line number */
    private references: Record<Namespace, ClassReference[]> = {};
    /* The namespace that is being written to */
    private namespace: string | undefined;

    constructor({ namespace }: Writer.Args) {
        this.namespace = namespace;
    }

    public write(text: string): void {
        const textEndsInNewline = text.length > 0 && text.endsWith("\n");
        // temporarily remove the trailing newline, since we don't want to add the indent prefix after it
        const textWithoutNewline = textEndsInNewline ? text.substring(0, text.length - 1) : text;

        const indent = this.getIndentString();
        let indentedText = textWithoutNewline.replace("\n", `\n${indent}`);
        if (this.isAtStartOfLine()) {
            indentedText = indent + indentedText;
        }
        if (textEndsInNewline) {
            indentedText += "\n";
        }
        this.writeInternal(indentedText);
    }

    public writeNode(node: AstNode): void {
        node.write(this);
    }

    /* Only writes a newline if last line in the buffer is not a newline */
    public writeLine(text = ""): void {
        this.write(text);
        this.writeNewLineIfLastLineNot();
    }

    /* Always writes newline */
    public newLine(): void {
        this.writeInternal("\n");
    }

    public writeNewLineIfLastLineNot(): void {
        if (!this.lastCharacterIsNewline) {
            this.writeInternal("\n");
        }
    }

    public indent(): void {
        this.indentLevel++;
    }

    public dedent(): void {
        this.indentLevel--;
    }

    public addReference(reference: ClassReference): void {
        const namespace = this.references[reference.namespace];
        if (namespace != null) {
            namespace.push(reference);
        } else {
            this.references[reference.namespace] = [reference];
        }
    }

    public toString(): string {
        const imports = this.stringifyImports();
        if (imports.length > 0) {
            return `${imports}\n\n${this.buffer}`;
        }
        return this.buffer;
    }

    /*******************************
     * Helper Methods
     *******************************/

    private writeInternal(text: string): string {
        if (text.length > 0) {
            this.hasWrittenAnything = true;
            this.lastCharacterIsNewline = text.endsWith("\n");
        }
        return (this.buffer += text);
    }

    private isAtStartOfLine(): boolean {
        return this.lastCharacterIsNewline || !this.hasWrittenAnything;
    }

    private getIndentString(): string {
        return " ".repeat(this.indentLevel * TAB_SIZE);
    }

    private stringifyImports(): string {
        return (
            Object.keys(this.references)
                // filter out the current namespace
                .filter((namespace) => namespace !== this.namespace)
                .map((ref) => `using ${ref};`)
                .join("\n")
        );
    }
}
