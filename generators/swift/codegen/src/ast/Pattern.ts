import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core";
import { DeclarationType } from "./DeclarationType";

type EnumCaseValueBinding = {
    type: "enum-case-value-binding";
    caseName: string;
    declarationType: DeclarationType;
    referenceName: string;
};

type InternalPattern = EnumCaseValueBinding;

export class Pattern extends AstNode {
    private internalPattern: InternalPattern;

    private constructor(internalPattern: InternalPattern) {
        super();
        this.internalPattern = internalPattern;
    }

    public write(writer: Writer): void {
        switch (this.internalPattern.type) {
            case "enum-case-value-binding":
                writer.write(".");
                writer.write(this.internalPattern.caseName);
                writer.write("(");
                writer.write(this.internalPattern.declarationType);
                writer.write(" ");
                writer.write(this.internalPattern.referenceName);
                writer.write(")");
                break;
            default:
                assertNever(this.internalPattern.type);
        }
    }

    public static enumCaseValueBinding(params: Omit<EnumCaseValueBinding, "type">): Pattern {
        return new this({
            type: "enum-case-value-binding",
            ...params
        });
    }
}
