import { AstNode } from "./AstNode";

export declare namespace Writer {
    interface Args {
        tabSize?: number;
    }
}

export class Writer {

    private buffer = "";
    private indentLevel = 0;
    private hasWrittenAnything = false;
    private readonly tabSize: number;

    constructor({ tabSize = 4 }: Writer.Args = {}) {
        this.tabSize = tabSize;
    }

    public write(text: string): void {

        if (this.hasWrittenAnything) {
            this.buffer += "\n";
        }

        const indent = this.getIndentString();
        const indentedText = indent + text.replace(/\n/g, `\n${indent}`);

        this.buffer += indentedText;

        this.hasWrittenAnything = true;

    }

    public newLine(): void {
        this.buffer += "\n";
    }

    public openIndent(): void {
        this.indentLevel++;
    }

    public closeIndent(): void {
        if (this.indentLevel > 0) {
            this.indentLevel--;
        }
    }

    public writeNode(node: AstNode): void {
        node.write(this); // Call the write method of AstNode passing this Writer instance
    }

    public toString(): string {
        return this.buffer;
    }

    private getIndentString(): string {
        return " ".repeat(this.indentLevel * this.tabSize);
    }
}