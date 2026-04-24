import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";

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
     *   - the single statement and the condition both render as a single line
     *
     * Returns undefined when the shape isn't eligible, in which case the caller
     * falls back to explicit if/end form.
     *
     * The generator's .rubocop.yml disables Layout/LineLength, so rubocop's
     * Style/IfUnlessModifier accepts modifier form at any line length. Shape
     * eligibility is therefore sufficient.
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

        const stmtRendered = renderNode(stmt, writer);
        const conditionRendered = renderNode(this.ifBranch.condition, writer);
        if (stmtRendered == null || conditionRendered == null) {
            return undefined;
        }
        // Modifier form requires the statement and condition to each render as a
        // single line; multi-line bodies (begin/rescue, nested blocks, etc.) stay
        // in explicit if/end form.
        if (stmtRendered.includes("\n") || conditionRendered.includes("\n")) {
            return undefined;
        }
        return `${stmtRendered} if ${conditionRendered}`;
    }
}

/**
 * Renders an AstNode to a string using a scratch writer so we can inspect it
 * before committing to the actual output buffer. Returns undefined if rendering
 * fails for any reason (we fall back to the explicit if/end form in that case).
 */
function renderNode(node: AstNode, parentWriter: Writer): string | undefined {
    try {
        const rendered = node.toString({
            customConfig: parentWriter.customConfig,
            formatter: parentWriter.formatter
        });
        // Strip any trailing newline writers may append via writeNewLineIfLastLineNot.
        return rendered.replace(/\n+$/, "");
    } catch {
        return undefined;
    }
}
