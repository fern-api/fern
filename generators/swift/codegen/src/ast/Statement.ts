import { assertNever } from "@fern-api/core-utils";
import { escapeReservedKeyword } from "../syntax";
import { AccessLevel } from "./AccessLevel";
import { CodeBlock } from "./CodeBlock";
import { AstNode, Writer } from "./core";
import { DeclarationType } from "./DeclarationType";
import { DocComment } from "./DocComment";
import { Expression } from "./Expression";
import { FunctionParameter } from "./FunctionParameter";
import { Pattern } from "./Pattern";
import { TypeReference } from "./TypeReference";

type TypealiasDeclaration = {
    type: "typealias-declaration";
    accessLevel?: AccessLevel;
    unsafeName: string;
    aliasedType: TypeReference;
    docs?: DocComment;
};

type ConstantDeclaration = {
    type: "constant-declaration";
    unsafeName: string;
    value: Expression;
    noTrailingNewline?: true;
};

type VariableDeclaration = {
    type: "variable-declaration";
    unsafeName: string;
    value: Expression;
    noTrailingNewline?: true;
};

type FunctionDeclaration = {
    type: "function-declaration";
    unsafeName: string;
    accessLevel?: AccessLevel;
    parameters?: FunctionParameter[];
    async?: true;
    throws?: true;
    returnType?: TypeReference;
    body?: CodeBlock;
    docs?: DocComment;
};

type VariableAssignment = {
    type: "variable-assignment";
    unsafeName: string;
    value: Expression;
};

type SelfAssignment = {
    type: "self-assignment";
    value: Expression;
};

type PropertyAssignment = {
    type: "property-assignment";
    unsafeName: string;
    value: Expression;
};

type DiscardAssignment = {
    type: "discard-assignment";
    value: Expression;
};

type Return = {
    type: "return";
    expression: Expression;
};

type Throw = {
    type: "throw";
    expression: Expression;
};

type ExpressionStatement = {
    type: "expression-statement";
    expression: Expression;
};

type ImportStatement = {
    type: "import";
    moduleName: string;
};

type Switch = {
    type: "switch";
    target: Expression;
    cases: {
        pattern: Expression | Pattern;
        body: Statement[];
    }[];
    defaultCase?: Statement[];
};

type If = {
    type: "if";
    condition: Statement;
    body: Statement[];
    elseIfs?: {
        condition: Statement;
        body: Statement[];
    }[];
    else?: Statement[];
};

type Raw = {
    type: "raw";
    content: string;
};

type InternalStatement =
    | TypealiasDeclaration
    | ConstantDeclaration
    | VariableDeclaration
    | FunctionDeclaration
    | VariableAssignment
    | SelfAssignment
    | PropertyAssignment
    | DiscardAssignment
    | Return
    | Throw
    | ExpressionStatement
    | ImportStatement
    | Switch
    | If
    | Raw;

export class Statement extends AstNode {
    private internalStatement: InternalStatement;

    private constructor(internalStatement: InternalStatement) {
        super();
        this.internalStatement = internalStatement;
    }

    public write(writer: Writer): void {
        switch (this.internalStatement.type) {
            case "typealias-declaration":
                if (this.internalStatement.docs != null) {
                    this.internalStatement.docs.write(writer);
                }
                if (this.internalStatement.accessLevel) {
                    writer.write(this.internalStatement.accessLevel);
                    writer.write(" ");
                }
                writer.write("typealias ");
                writer.write(this.internalStatement.unsafeName);
                writer.write(" = ");
                this.internalStatement.aliasedType.write(writer);
                writer.newLine();
                break;
            case "constant-declaration":
                writer.write(DeclarationType.Let);
                writer.write(" ");
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                if (!this.internalStatement.noTrailingNewline) {
                    writer.newLine();
                }
                break;
            case "variable-declaration":
                writer.write(DeclarationType.Var);
                writer.write(" ");
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                if (!this.internalStatement.noTrailingNewline) {
                    writer.newLine();
                }
                break;
            case "function-declaration":
                if (this.internalStatement.docs != null) {
                    this.internalStatement.docs.write(writer);
                }
                if (this.internalStatement.accessLevel != null) {
                    writer.write(this.internalStatement.accessLevel);
                    writer.write(" ");
                }
                writer.write("func ");
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName));
                writer.write("(");
                this.internalStatement.parameters?.forEach((parameter, parameterIdx) => {
                    if (parameterIdx > 0) {
                        writer.write(", ");
                    }
                    parameter.write(writer);
                });
                writer.write(")");
                if (this.internalStatement.async) {
                    writer.write(" async");
                }
                if (this.internalStatement.throws) {
                    writer.write(" throws");
                }
                if (this.internalStatement.returnType) {
                    writer.write(" -> ");
                    this.internalStatement.returnType.write(writer);
                }
                writer.write(" ");
                (this.internalStatement.body ?? CodeBlock.empty()).write(writer);
                writer.newLine();
                break;
            case "variable-assignment":
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                writer.newLine();
                break;
            case "self-assignment":
                writer.write("self = ");
                writer.write(this.internalStatement.value.toString());
                writer.newLine();
                break;
            case "property-assignment":
                writer.write("self.");
                writer.write(this.internalStatement.unsafeName);
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                writer.newLine();
                break;
            case "discard-assignment":
                writer.write("_ = ");
                this.internalStatement.value.write(writer);
                writer.newLine();
                break;
            case "return":
                writer.write("return ");
                this.internalStatement.expression.write(writer);
                writer.newLine();
                break;
            case "throw":
                writer.write("throw ");
                this.internalStatement.expression.write(writer);
                writer.newLine();
                break;
            case "expression-statement":
                this.internalStatement.expression.write(writer);
                writer.newLine();
                break;
            case "import":
                writer.write("import ");
                writer.write(this.internalStatement.moduleName);
                writer.newLine();
                break;
            case "switch":
                writer.write("switch ");
                this.internalStatement.target.write(writer);
                writer.write(" {");
                writer.newLine();
                for (const switchCase of this.internalStatement.cases) {
                    writer.write("case ");
                    switchCase.pattern.write(writer);
                    writer.write(":");
                    writer.newLine();
                    if (switchCase.body.length > 0) {
                        writer.indent();
                        for (const statement of switchCase.body) {
                            statement.write(writer);
                        }
                        writer.dedent();
                    }
                }
                if (this.internalStatement.defaultCase) {
                    writer.write("default:");
                    writer.newLine();
                    if (this.internalStatement.defaultCase.length > 0) {
                        writer.indent();
                        for (const statement of this.internalStatement.defaultCase) {
                            statement.write(writer);
                        }
                        writer.dedent();
                    }
                }
                writer.write("}");
                writer.newLine();
                break;
            case "if": {
                writer.write("if ");
                this.internalStatement.condition.write(writer);
                writer.write(" ");
                CodeBlock.withStatements(this.internalStatement.body).write(writer);
                for (const elseIf of this.internalStatement.elseIfs ?? []) {
                    writer.write(" else if ");
                    elseIf.condition.write(writer);
                    writer.write(" ");
                    CodeBlock.withStatements(elseIf.body).write(writer);
                }
                if (this.internalStatement.else) {
                    writer.write(" else ");
                    CodeBlock.withStatements(this.internalStatement.else).write(writer);
                }
                writer.newLine();
                break;
            }
            case "raw":
                writer.write(this.internalStatement.content);
                writer.newLine();
                break;
            default:
                assertNever(this.internalStatement);
        }
    }

    public static typealiasDeclaration(params: Omit<TypealiasDeclaration, "type">): Statement {
        return new this({ type: "typealias-declaration", ...params });
    }

    public static constantDeclaration(params: Omit<ConstantDeclaration, "type">): Statement {
        return new this({ type: "constant-declaration", ...params });
    }

    public static variableDeclaration(params: Omit<VariableDeclaration, "type">): Statement {
        return new this({ type: "variable-declaration", ...params });
    }

    public static functionDeclaration(params: Omit<FunctionDeclaration, "type">): Statement {
        return new this({ type: "function-declaration", ...params });
    }

    public static variableAssignment(unsafeName: string, value: Expression): Statement {
        return new this({ type: "variable-assignment", unsafeName, value });
    }

    public static selfAssignment(value: Expression): Statement {
        return new this({ type: "self-assignment", value });
    }

    public static propertyAssignment(unsafeName: string, value: Expression): Statement {
        return new this({ type: "property-assignment", unsafeName, value });
    }

    public static discardAssignment(value: Expression): Statement {
        return new this({ type: "discard-assignment", value });
    }

    public static return(expression: Expression): Statement {
        return new this({ type: "return", expression });
    }

    public static throw(expression: Expression): Statement {
        return new this({ type: "throw", expression });
    }

    public static expressionStatement(expression: Expression): Statement {
        return new this({ type: "expression-statement", expression });
    }

    public static import(moduleName: string): Statement {
        return new this({ type: "import", moduleName });
    }

    public static switch(params: Omit<Switch, "type">): Statement {
        return new this({ type: "switch", ...params });
    }

    public static if(params: Omit<If, "type">): Statement {
        return new this({ type: "if", ...params });
    }

    /**
     * Escape hatch for writing raw Swift code. Intended for use in tests.
     */
    public static raw(content: string): Statement {
        return new this({ type: "raw", content });
    }
}
