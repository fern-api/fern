import { AstNode } from "./AstNode";

export declare namespace Writer {
    interface Args {
        tabSize?: number;
    }
}

export class Writer {
    private buffer: string;
    private indentLevel: number;
    private hasWrittenAnything: boolean;
    private indentSize: number;

    constructor(indentSize: number) {
        this.buffer = "";
        this.indentLevel = 0;
        this.hasWrittenAnything = false;
        this.indentSize = indentSize;
    }

    public write(text: string): void {
        if (this.hasWrittenAnything) {
            this.buffer += "\n";
        }

        const indent = this.getIndentString(this.indentSize);
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
        node.write(this);
    }

    public toString(): string {
        return this.buffer;
    }

    private getIndentString(tabSize: number): string {
        return " ".repeat(this.indentLevel * tabSize);
    }
}
