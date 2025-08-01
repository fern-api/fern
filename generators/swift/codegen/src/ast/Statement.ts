import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core";
import { DeclarationType } from "./DeclarationType";
import { Expression } from "./Expression";
import { escapeReservedKeyword } from "./syntax/reserved-keywords";

type ConstantDeclaration = {
    type: "constant-declaration";
    unsafeName: string;
    value: Expression;
};

type VariableDeclaration = {
    type: "variable-declaration";
    unsafeName: string;
    value: Expression;
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
        pattern: Expression;
        body: Statement[];
    }[];
    defaultCase?: Statement[];
};

type InternalStatement =
    | ConstantDeclaration
    | VariableDeclaration
    | VariableAssignment
    | SelfAssignment
    | PropertyAssignment
    | Return
    | Throw
    | ExpressionStatement
    | ImportStatement
    | Switch;

export class Statement extends AstNode {
    private internalStatement: InternalStatement;

    private constructor(internalStatement: InternalStatement) {
        super();
        this.internalStatement = internalStatement;
    }

    public write(writer: Writer): void {
        switch (this.internalStatement.type) {
            case "constant-declaration":
                writer.write(DeclarationType.Let);
                writer.write(" ");
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                break;
            case "variable-declaration":
                writer.write(DeclarationType.Var);
                writer.write(" ");
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                break;
            case "variable-assignment":
                writer.write(escapeReservedKeyword(this.internalStatement.unsafeName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                break;
            case "self-assignment":
                writer.write("self = ");
                writer.write(this.internalStatement.value.toString());
                break;
            case "property-assignment":
                writer.write("self.");
                writer.write(this.internalStatement.unsafeName);
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                break;
            case "return":
                writer.write("return ");
                this.internalStatement.expression.write(writer);
                break;
            case "throw":
                writer.write("throw ");
                this.internalStatement.expression.write(writer);
                break;
            case "expression-statement":
                this.internalStatement.expression.write(writer);
                break;
            case "import":
                writer.write("import ");
                writer.write(this.internalStatement.moduleName);
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
                break;
            default:
                assertNever(this.internalStatement);
        }
        writer.newLine();
    }

    public static constantDeclaration(unsafeName: string, value: Expression): Statement {
        return new this({ type: "constant-declaration", unsafeName, value });
    }

    public static variableDeclaration(unsafeName: string, value: Expression): Statement {
        return new this({ type: "variable-declaration", unsafeName, value });
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
}
