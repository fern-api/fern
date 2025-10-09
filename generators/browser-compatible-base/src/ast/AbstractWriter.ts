import { AbstractAstNode } from "./AbstractAstNode";
import { CodeBlock } from "./CodeBlock";

const TAB_SIZE = 4;

const enableStackTracking = !!process.env["FERN_STACK_TRACK"];

if (enableStackTracking) {
    // let it get more frames, we like to trim out a bunch.
    Error.stackTraceLimit = 50;
}

export class AbstractWriter {
    /* The contents being written */
    public buffer = "";
    /* Indentation level (multiple of 4) */
    private indentLevel = 0;
    /* Whether anything has been written to the buffer */
    private hasWrittenAnything = false;
    /* Whether the last character written was a semi colon */
    private lastCharacterIsSemicolon = false;
    /* Whether the last character written was a newline */
    private lastCharacterIsNewline = false;

    /**
     * Writes arbitrary text and nodes
     * @param text
     */
    public write(...parts: (string | AbstractAstNode | undefined)[]): void {
        for (const text of parts) {
            if (text != null) {
                if (typeof text === "string") {
                    const textEndsInNewline = text.length > 0 && text.endsWith("\n");
                    // temporarily remove the trailing newline, since we don't want to add the indent prefix after it
                    const textWithoutNewline = textEndsInNewline ? text.substring(0, text.length - 1) : text;

                    const indent = this.getIndentString();
                    let indentedText = textWithoutNewline.replaceAll("\n", `\n${indent}`);
                    if (this.isAtStartOfLine()) {
                        indentedText = indent + indentedText;
                    }
                    if (textEndsInNewline) {
                        indentedText += "\n";
                    }
                    this.writeInternal(indentedText);
                } else {
                    this.writeNode(text);
                }
            }
        }
    }

    public writeStatement(...parts: (string | AbstractAstNode | undefined)[]): void {
        this.write(...parts);
        this.write(";");
        this.writeNewLineIfLastLineNot();
    }

    /**
     * Writes arbitrary text without indentation
     * @param text
     */
    public writeNoIndent(text: string): void {
        const currIndentLevel = this.indentLevel;
        this.indentLevel = 0;
        this.write(text);
        this.indentLevel = currIndentLevel;
    }

    /**
     * Writes a node
     * @param node
     */
    public writeNode(node: AbstractAstNode): void {
        node.write(this);
    }

    /**
     * Writes a node or string
     * @param input
     */
    public writeNodeOrString(input: AbstractAstNode | string): void {
        if (typeof input === "string") {
            this.write(input);
            return;
        }

        this.writeNode(input);
    }

    /**
     * Writes a node but then suffixes with a `;` and new line
     * @param node
     */
    public writeNodeStatement(node: AbstractAstNode): void {
        node.write(this);
        this.write(";");
        this.writeNewLineIfLastLineNot();
    }

    /**
     * Writes text but then suffixes with a `;`
     * @param node
     */
    public writeTextStatement(text: string): void {
        const codeBlock = new CodeBlock(text);
        codeBlock.write(this);
        if (!text.endsWith(";")) {
            this.write(";");
        }
        this.writeNewLineIfLastLineNot();
    }

    /**
     * Starts a control flow block
     * @param prefix
     * @param statement
     */
    public controlFlow(prefix: string, statement: AbstractAstNode): void {
        const codeBlock = new CodeBlock(prefix);
        codeBlock.write(this);
        this.write(" (", statement, ")");
        this.push();
    }

    /**
     * Starts a control flow block
     * @param prefix
     * @param statement
     */
    public controlFlowWithoutStatement(prefix: string): void {
        const codeBlock = new CodeBlock(prefix);
        codeBlock.write(this);
        this.push();
    }

    /**
     * Ends a control flow block
     */
    public endControlFlow(): void {
        this.pop();
    }

    /**
     * Starts a control flow without a newline from the previous control flow block
     * @param prefix
     * @param statement
     */
    public contiguousControlFlow(prefix: string, statement: AbstractAstNode): void {
        this.dedent();
        this.write("} ");
        const codeBlock = new CodeBlock(prefix);
        codeBlock.write(this);
        this.write(" (", statement, ")");
        this.push();
    }

    /**
     * Starts a control flow alternative block
     * @param prefix
     */
    public alternativeControlFlow(prefix: string): void {
        this.dedent();
        this.write("} ");
        const codeBlock = new CodeBlock(prefix);
        codeBlock.write(this);
        this.push();
    }

    public push() {
        this.writeLine("{");
        this.indent();
    }

    public pop(withNewline = true) {
        this.dedent();
        this.writeNewLineIfLastLineNot();
        if (withNewline) {
            this.writeLine("}");
        } else {
            this.write("}");
        }
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

    public writeSemicolonIfLastCharacterIsNot(): void {
        if (!this.lastCharacterIsSemicolon) {
            this.writeInternal(";");
        }
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

    public delimit<T extends AbstractAstNode>({
        nodes,
        delimiter,
        writeFunction
    }: {
        nodes: T[];
        delimiter: string;
        writeFunction: (node: T) => void;
    }): void {
        if (nodes.length > 0) {
            const firstNode = nodes[0];
            if (firstNode != null) {
                writeFunction(firstNode);
            }
            for (let i = 1; i < nodes.length; i++) {
                this.write(delimiter);
                const node = nodes[i];
                if (node != null) {
                    writeFunction(node);
                }
            }
        }
    }

    public toString(): string {
        return this.buffer;
    }

    /*******************************
     * Helper Methods
     *******************************/

    private writeInternal(text: string): string {
        if (text.length > 0) {
            this.hasWrittenAnything = true;
            this.lastCharacterIsNewline = text.endsWith("\n");
            this.lastCharacterIsSemicolon = text.endsWith(";");
        }
        this.buffer += text;

        if (enableStackTracking && this.buffer.endsWith("\n") && !this.buffer.endsWith('"""\n')) {
            const stackLine = this.stacktrace(15)
                .map((each) => `${each.fn} - ${each.path}:${each.position}`)
                .join(" ");
            if (stackLine) {
                this.buffer = this.buffer.slice(0, -1);
                // this marker is used to easily identify stack traces in the generated code
                // (it also makes it easy to grep for them in a diff to make sure you're not commiting them)
                // use ` git diff | grep -i "//@@" ` to check
                this.buffer += `//` + `@@ ${stackLine}\n`;
            }
        }

        return this.buffer;
    }

    private isAtStartOfLine(): boolean {
        return this.lastCharacterIsNewline || !this.hasWrittenAnything;
    }

    private getIndentString(): string {
        return " ".repeat(this.indentLevel * this.getTabSize());
    }

    protected getTabSize(): number {
        return TAB_SIZE;
    }

    /**
     * This function is used to get the stack trace of the current code execution point.$
     * It cleans up the stack trace to remove unnecessary frames and return a list of frames.
     * (Used for debugging purposes)
     *
     * @returns A list of frames with the function name, path, and position.
     */
    private stacktrace(maxFrames: number = 50): { fn: string; path: string; position: string }[] {
        let stop = false;
        return (
            (new Error().stack ?? "")
                .split("\n")
                .map((line) => {
                    const match = line.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
                    if (match && match.length === 5) {
                        let [, fn, path, line, column] = match;
                        if (stop || fn?.includes("runInteractiveTask")) {
                            stop = true;
                            return undefined;
                        }
                        switch (fn) {
                            case "Object.<anonymous>":
                                fn = "";
                                break;
                            case "Object.object":
                            case "Object.alias":
                            case "Object.union":
                            case "Object.enum":
                            case "Object.undiscriminatedUnion":
                                fn = `${fn.substring(fn.indexOf(".") + 1)}()=> { ... }`;
                                break;
                        }
                        return { fn, path: path?.replace(/^.*?fern.*?\//, "") ?? "", position: `${line}:${column}` };
                    }
                    return undefined;
                })
                .filter(
                    (each) =>
                        each &&
                        !each.path?.startsWith("node:") &&
                        !each.path?.endsWith(".js") &&
                        !each.path?.includes("AbstractWriter") &&
                        !each.fn?.includes("stacktrace") &&
                        !each.fn?.includes("stackLine") &&
                        !each.fn?.includes("SdkGeneratorCLI") &&
                        !each.fn?.includes("runCli")
                ) as {
                fn: string;
                path: string;
                position: string;
            }[]
        ).slice(0, maxFrames);
    }
}
