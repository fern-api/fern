import { Begin } from "./Begin.js";
import { Class_ } from "./Class.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Method } from "./Method.js";
import { Module_ } from "./Module.js";

/**
 * Represents an if-else statement in the AST.
 */
export declare namespace IfElse {
    export type If = {
        condition: AstNode;
        thenBody: AstNode[];
    };

    interface Args {
        /** The primary if clause */
        if: IfElse.If;
        /** Optional else-if clauses */
        elseIf?: IfElse.If[];
        /** The body to execute if all conditions are false (optional) */
        elseBody?: AstNode;
    }
}

export class IfElse extends AstNode {
    public readonly ifBranch: IfElse.If;
    public readonly elseIfs: IfElse.If[];
    public readonly elseBody: AstNode[] | undefined;

    constructor({ if: ifBranch, elseIf, elseBody }: IfElse.Args) {
        super();
        this.ifBranch = ifBranch;
        this.elseIfs = elseIf ?? [];
        this.elseBody = elseBody ? (Array.isArray(elseBody) ? elseBody : [elseBody]) : undefined;
    }

    public write(writer: Writer): void {
        const modifier = this.renderAsModifier(writer);
        if (modifier != null) {
            writer.write(modifier);
            writer.writeNewLineIfLastLineNot();
            return;
        }

        // Write the primary if branch
        writer.write("if ");
        this.ifBranch.condition.write(writer);
        writer.writeLine();
        writer.indent();
        for (const stmt of this.ifBranch.thenBody) {
            stmt.write(writer);
            writer.writeNewLineIfLastLineNot();
        }
        writer.dedent();

        // Write else-if branches if any
        for (const elseIf of this.elseIfs) {
            writer.write("elsif ");
            elseIf.condition.write(writer);
            writer.writeLine();
            writer.indent();
            for (const stmt of elseIf.thenBody) {
                stmt.write(writer);
                writer.writeNewLineIfLastLineNot();
            }
            writer.dedent();
        }

        // Write else body if present
        if (this.elseBody && this.elseBody.length > 0) {
            writer.writeLine("else");
            writer.indent();
            for (const stmt of this.elseBody) {
                stmt.write(writer);
                writer.writeNewLineIfLastLineNot();
            }
            writer.dedent();
        }
        writer.write("end");
        writer.writeNewLineIfLastLineNot();
    }

    /**
     * Returns the modifier-form rendering (`stmt if cond`) when this if is
     * eligible:
     *   - exactly one statement in the then-body
     *   - no elsif and no else
     *   - the single statement is not an intrinsically multi-line AST node
     *     (Class, Module, Method, Begin, IfElse)
     *   - the rendered statement and condition each fit on a single line
     *
     * Returns undefined when the shape isn't eligible, in which case the caller
     * falls back to explicit if/end form.
     *
     * The generator's .rubocop.yml disables Layout/LineLength, so rubocop's
     * Style/IfUnlessModifier accepts modifier form at any line length. Shape
     * eligibility is therefore sufficient; we don't gate on a max-line-length
     * budget here.
     */
    private renderAsModifier(writer: Writer): string | undefined {
        if (this.ifBranch.thenBody.length !== 1) {
            return undefined;
        }
        if (this.elseIfs.length > 0) {
            return undefined;
        }
        if (this.elseBody != null && this.elseBody.length > 0) {
            return undefined;
        }
        const stmt = this.ifBranch.thenBody[0];
        if (stmt == null) {
            return undefined;
        }
        if (isKnownMultiLineNode(stmt) || isKnownMultiLineNode(this.ifBranch.condition)) {
            return undefined;
        }

        const stmtRendered = renderNode(stmt, writer);
        const conditionRendered = renderNode(this.ifBranch.condition, writer);
        // Modifier form requires the statement and condition to each render as a
        // single, non-empty line; multi-line or empty bodies stay in explicit
        // if/end form.
        if (stmtRendered.length === 0 || conditionRendered.length === 0) {
            return undefined;
        }
        if (stmtRendered.includes("\n") || conditionRendered.includes("\n")) {
            return undefined;
        }
        return `${stmtRendered} if ${conditionRendered}`;
    }
}

/**
 * AST node types whose write() always emits multiple lines. Rejecting them up
 * front avoids a speculative render of the whole subtree just to discover it
 * can never fit on one line.
 */
function isKnownMultiLineNode(node: AstNode): boolean {
    // IfElse is included because rubocop's Style/IfUnlessModifierOfIfUnless
    // rejects nested modifier form (`return if x if y`), so we always keep
    // nested if/unless in explicit form.
    return (
        node instanceof Class_ ||
        node instanceof Module_ ||
        node instanceof Method ||
        node instanceof Begin ||
        node instanceof IfElse
    );
}

/**
 * Renders an AstNode to a string using a scratch writer so we can inspect it
 * before committing to the actual output buffer. Trailing newlines emitted by
 * the child node's own writeNewLineIfLastLineNot calls are stripped so the
 * modifier form can join the `if` clause cleanly.
 */
function renderNode(node: AstNode, parentWriter: Writer): string {
    const rendered = node.toString({
        customConfig: parentWriter.customConfig,
        formatter: parentWriter.formatter
    });
    return rendered.replace(/\n+$/, "");
}
