import { assertNever } from "@fern-api/core-utils";

import { DeclarationType } from "./DeclarationType";
import { Expression } from "./Expression";
import { AstNode, Writer } from "./core";
import { escapeReservedKeyword } from "./syntax/reserved-keywords";

type ConstantAssignment = {
    type: "constant-assignment";
    constantName: string;
    value: Expression;
};

type VariableAssignment = {
    type: "variable-assignment";
    variableName: string;
    value: Expression;
};

type Return = {
    type: "return";
    expression: Expression;
};

type InternalStatement = ConstantAssignment | VariableAssignment | Return;

export class Statement extends AstNode {
    private internalStatement: InternalStatement;

    private constructor(internalStatement: InternalStatement) {
        super();
        this.internalStatement = internalStatement;
    }

    public write(writer: Writer): void {
        switch (this.internalStatement.type) {
            case "constant-assignment":
                writer.write(DeclarationType.Let);
                writer.write(" ");
                writer.write(escapeReservedKeyword(this.internalStatement.constantName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                writer.newLine();
                break;
            case "variable-assignment":
                writer.write(DeclarationType.Var);
                writer.write(" ");
                writer.write(escapeReservedKeyword(this.internalStatement.variableName));
                writer.write(" = ");
                this.internalStatement.value.write(writer);
                writer.newLine();
                break;
            case "return":
                writer.write("return ");
                this.internalStatement.expression.write(writer);
                writer.newLine();
                break;
            default:
                assertNever(this.internalStatement);
        }
    }

    public static constantAssignment(constantName: string, value: Expression): Statement {
        return new this({ type: "constant-assignment", constantName, value });
    }

    public static return(expression: Expression): Statement {
        return new this({ type: "return", expression });
    }
}
