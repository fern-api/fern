import { format } from "util";
import { Import } from "../Import";

export enum NewLinePlacement {
    BEFORE,
    AFTER,
    NONE
}
export declare namespace AstNode {
    export interface Init {
        documentation?: string;
        contentOverride?: string;
    }

    export interface AddText {
        stringContent?: string;
        templateString?: string;
        appendToLastString?: boolean;
        startingTabSpaces?: number;
    }
}
export abstract class AstNode {
    // We could also track line length, but we'd likely be better off running Rubocop to format the code after it's written
    public tabSizeSpaces = 2;
    public documentation: string | undefined;
    // This field takes precedence over the node's write function, this
    // should be used if you know exactly the content you'd like to generate
    public contentOverride: string | undefined;

    // Pretty print content
    private text: string[] = [];

    constructor({ documentation, contentOverride }: AstNode.Init) {
        // TODO: Make documentation a list of strings split by returns then make them multi-line comments
        this.documentation = documentation?.replace("\n", " ");
        this.contentOverride = contentOverride;
    }

    public abstract writeInternal(startingTabSpaces: number): void;

    protected writePaddedString(startingTabSpaces: number, content: string): string {
        return `${" ".repeat(startingTabSpaces)}${content}`;
    }

    protected addText({
        stringContent,
        templateString,
        appendToLastString = false,
        startingTabSpaces = 0
    }: AstNode.AddText): void {
        if (stringContent === undefined) {
            return;
        }
        if (templateString !== undefined) {
            stringContent = format(templateString, stringContent);
        }

        if (appendToLastString && this.text.length > 0) {
            // throw new Error("here we are" + this.text[-1]);
            this.text[this.text.length - 1] += stringContent;
        } else {
            stringContent = this.writePaddedString(startingTabSpaces, stringContent);

            this.text.push(stringContent);
        }
    }

    protected addNewLine(): void {
        this.text.push("");
    }

    public write(startingTabSpaces = 0): string {
        this.writeInternal(startingTabSpaces);
        const text =
            this.contentOverride !== undefined
                ? this.writePaddedString(startingTabSpaces, this.contentOverride)
                : this.text.join("\n");
        // Reset text buffer
        this.text = [];
        return text;
    }

    // Effectively: to use this node, what do I need to import
    public getImports(): Set<Import> {
        return new Set();
    }
}
