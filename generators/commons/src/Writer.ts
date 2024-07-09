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

    public openBlock(
        titles: (string | undefined)[],
        openingCharacter: string | undefined = "{",
        callback: () => void,
        closingCharacter: string | undefined = "}"
    ): void {
        const filteredTitles = titles.filter(title => title !== undefined).join(" ");
        if (filteredTitles) {
            this.write(`${filteredTitles} ${openingCharacter ?? ""}`);
        } else {
            this.write(openingCharacter ?? "");
        }
        
        try {
            this.indent(callback);
        } finally {
            this.write(closingCharacter ?? "");
        }
    }

    public indent(callback: () => void): void {
        this.indentLevel++;
        try {
            callback();
        } finally {
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

    public writeSnippetWithVariables(template: string, variables: Record<string, string | undefined>): void {
        const filledTemplate = template.replace(/\$(\d+)/g, (_, index) => {
            const value = variables[index];
            return value !== undefined ? value : '';
        });

        // Handle removing only placeholders and keeping the rest of the template as is
        const cleanedTemplate = filledTemplate.replace(/(\s*\$\d+\s*)/g, '').replace(/\n\s*\n/g, '\n');
        this.write(cleanedTemplate);
    }
    
}
