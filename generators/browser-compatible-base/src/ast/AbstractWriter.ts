import { enableStackTracking } from "../utils";
import { frames, StackTraceFrame, stacktrace, startTracking, trackingType } from "../utils/stacktrace";
import { AbstractAstNode } from "./AbstractAstNode";
import { CodeBlock } from "./CodeBlock";

const TAB_SIZE = 4;
// this will start tracking only when FERN_STACK_TRACK is defined
// otherwise this has absolutely no effect whatsoever.
startTracking({ skip: 0, maxFrames: 15, filterFunctions: ["Abstract"] });

export class AbstractWriter {
    /* The buffer of lines being written */
    protected readonly lineBuffer: string[] = [];

    /* The contents being written */
    public get buffer() {
        return this.lineBuffer.join("\n") + (this.lastCharacterIsNewline ? "\n" : "");
    }

    /* Indentation level (multiple of 4) */
    private indentLevel = 0;
    /* Whether anything has been written to the buffer */
    private hasWrittenAnything = false;
    /* Whether the last character written was a semi colon */
    private lastCharacterIsSemicolon = false;
    /* Whether the last character written was a newline */
    private lastCharacterIsNewline = false;
    /* The stack traces associated with the current node */
    private nodeStackFrames: StackTraceFrame[] = [];

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
        this.nodeStackFrames.push(...frames(node));
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
        this.writeNode(node);
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
        this.pushScope();
    }

    /**
     * Starts a control flow block
     * @param prefix
     * @param statement
     */
    public controlFlowWithoutStatement(prefix: string): void {
        const codeBlock = new CodeBlock(prefix);
        codeBlock.write(this);
        this.pushScope();
    }

    /**
     * Ends a control flow block
     */
    public endControlFlow(): void {
        this.popScope();
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
        this.pushScope();
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
        this.pushScope();
    }

    public pushScope() {
        this.writeLine("{");
        this.indent();
    }

    public popScope(withNewline = true) {
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
    private writeInternal(text: string) {
        if (text.length === 0) {
            return;
        }

        const appendToLastLine = !this.lastCharacterIsNewline;

        this.hasWrittenAnything = true;
        this.lastCharacterIsNewline = text.endsWith("\n");
        this.lastCharacterIsSemicolon = text.endsWith(";");

        const lines = text.split("\n");

        const appendTrackingComment =
            enableStackTracking && !this.shouldSkipTracking(lines) && this.lastCharacterIsNewline;

        if (appendToLastLine) {
            this.lastLine = `${this.lastLine}${lines.shift() || ""}`;
        }

        if (this.lastCharacterIsNewline) {
            lines.pop();
        }

        this.lineBuffer.push(...lines);

        if (appendTrackingComment) {
            this.appendTrackingComment();
        }
    }

    /**
     * Sets the last line of the buffer
     * @param line - The line to set
     */
    protected set lastLine(line: string) {
        if (this.lineBuffer.length > 0) {
            this.lineBuffer[this.lineBuffer.length - 1] = line;
        } else {
            this.lineBuffer.push(line);
        }
    }

    /**
     * Gets the last line of the buffer
     * @returns The last line of the buffer
     */
    protected get lastLine() {
        return this.lineBuffer[this.lineBuffer.length - 1] || "";
    }

    /**
     * Determines if the tracking comment should be skipped
     * @param lines - The that are being written out
     *
     * @returns True if the tracking comment should be skipped
     */
    protected shouldSkipTracking(lines: string[]) {
        return false;
    }

    /**
     * Formats the stack trace frames into a string
     * @param stack - The stack trace to format
     * @param prefix - The prefix to add to the stack trace
     * @returns The formatted stack trace
     */
    protected formatStack(stack: StackTraceFrame[], prefix = "") {
        return stack.map((each) => `${prefix ? `(${prefix}) ` : ""} ${each.fn} - ${each.path} : ${each.position}`);
    }

    /** filters out frames that start with the name of the current class */
    protected filterStack(stack: StackTraceFrame[]) {
        return stack.filter((each) => !each.fn.startsWith(`${this.constructor.name}.`));
    }

    /**
     * Prepares the stack trace and calls the appropriate tracking comment formatter
     */
    protected appendTrackingComment() {
        const stack = [
            // adds the stack frames of the current function call
            ...this.formatStack(this.filterStack(stacktrace({ maxFrames: 15, skip: 3 }))),

            // adds the stack frames of any AstNodes that have been written since the last tracking comment
            ...new Set(this.formatStack(this.filterStack(this.nodeStackFrames), "node"))
        ];
        // reset the ast node stack frames
        this.nodeStackFrames.length = 0;

        switch (trackingType) {
            case "single":
                return this.singleLineTrackingComment(stack);

            case "multiline":
                return this.multiLineTrackingComment(stack);

            case "box":
                return this.boxTrackingComment(stack);
        }
    }

    /**
     * Creates a single line tracking comment
     *
     * Override this to change the format of the comment.
     *
     * @param stack - The stack trace to add to the comment
     */
    protected singleLineTrackingComment(stack: string[]) {
        this.lastLine = `${this.lastLine} // ${stack.join(" ")}`;
    }
    /**
     * Creates a multi line tracking comment
     *
     * Override this to change the format of the comment.
     *
     * @param stack - The stack trace to add to the comment
     */
    protected multiLineTrackingComment(stack: string[]) {
        this.lineBuffer.push(...stack.map((each) => `    // ${each}`));
    }
    /**
     * Creates a box tracking comment
     *
     * Override this to change the format of the comment.
     *
     * @param stack - The stack trace to add to the comment
     */
    protected boxTrackingComment(stack: string[]) {
        this.lineBuffer.push("/*", ...stack.map((each) => `    ${each}`), "*/");
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
}
