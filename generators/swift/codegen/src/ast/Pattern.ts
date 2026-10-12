import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core/index.js";
import { DeclarationType } from "./DeclarationType.js";

type EnumCaseValueBinding = {
    type: "enum-case-value-binding";
    /** Qualifies the case with its enum type (e.g. `MyError.httpError(let error)`), required where the type can't be inferred. */
    enumTypeName?: string;
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
                if (this.internalPattern.enumTypeName != null) {
                    writer.write(this.internalPattern.enumTypeName);
                }
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
