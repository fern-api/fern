import { assertNever } from "@fern-api/core-utils";

import { Expression } from "./Expression";
import { AstNode, Writer } from "./core";

type Assignment = {
    type: "assignment";
    lhs: string;
    rhs: Expression;
};

type Return = {
    type: "return";
    expression: Expression;
};

type InternalStatement = Assignment | Return;

export class Statement extends AstNode {
    private internalStatement: InternalStatement;

    private constructor(internalStatement: InternalStatement) {
        super();
        this.internalStatement = internalStatement;
    }

    public write(writer: Writer): void {
        switch (this.internalStatement.type) {
            case "assignment":
                writer.write(this.internalStatement.lhs);
                writer.write(" = ");
                this.internalStatement.rhs.write(writer);
                break;
            case "return":
                writer.write("return ");
                this.internalStatement.expression.write(writer);
                break;
            default:
                assertNever(this.internalStatement);
        }
    }

    public static assignment(lhs: string, rhs: Expression): Statement {
        return new this({ type: "assignment", lhs, rhs });
    }

    public static return(expression: Expression): Statement {
        return new this({ type: "return", expression });
    }
}
