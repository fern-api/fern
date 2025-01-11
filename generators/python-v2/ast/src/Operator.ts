import { assertNever } from "@fern-api/core-utils";

import { OperatorType } from "./OperatorType";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Operator {
    interface Args {
        operator: OperatorType;
        lhs: AstNode;
        rhs: AstNode;
    }
}

export class Operator extends AstNode {
    private readonly operator: OperatorType;
    private readonly lhs: AstNode;
    private readonly rhs: AstNode;

    public constructor({ operator, lhs, rhs }: Operator.Args) {
        super();
        this.operator = operator;
        this.lhs = lhs;
        this.inheritReferences(lhs);
        this.rhs = rhs;
        this.inheritReferences(rhs);
    }

    private getOperatorString(): string {
        switch (this.operator) {
            case OperatorType.Or:
                return "or";
            case OperatorType.And:
                return "and";
            case OperatorType.LeftShift:
                return "<<";
            case OperatorType.RightShift:
                return ">>";
            default:
                assertNever(this.operator);
        }
    }

    public write(writer: Writer): void {
        this.lhs.write(writer);
        writer.write(" ");
        writer.write(this.getOperatorString());
        writer.write(" ");
        this.rhs.write(writer);
    }
}
