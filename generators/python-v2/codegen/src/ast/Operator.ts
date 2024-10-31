import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { assertNever } from "@fern-api/core-utils";

type OperatorType = "or" | "and";

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
            case "or":
                return "or";
            case "and":
                return "and";
            default:
                assertNever(this.operator);
        }
    }

    public write(writer: Writer): void {
        writer.write(`${this.lhs.toString()} `);
        writer.write(this.getOperatorString());
        writer.write(` ${this.rhs.toString()}`);
    }
}
