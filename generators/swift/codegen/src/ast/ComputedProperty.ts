import { assertNever } from "@fern-api/core-utils";
import { escapeReservedKeyword } from "../syntax/index.js";
import { AccessLevel } from "./AccessLevel.js";
import { CodeBlock } from "./CodeBlock.js";
import { AstNode, Writer } from "./core/index.js";
import { DocComment } from "./DocComment.js";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";
import { TypeReference } from "./TypeReference.js";

export declare namespace ComputedProperty {
    interface Args {
        unsafeName: string;
        accessLevel?: AccessLevel;
        type: TypeReference;
        body: Expression | CodeBlock;
        docs?: DocComment;
    }
}

export class ComputedProperty extends AstNode {
    public readonly unsafeName: string;
    public readonly accessLevel?: AccessLevel;
    public readonly type: TypeReference;
    public readonly body: Expression | CodeBlock;
    public readonly docs?: DocComment;

    public constructor({ unsafeName, accessLevel, type, body, docs }: ComputedProperty.Args) {
        super();
        this.unsafeName = unsafeName;
        this.accessLevel = accessLevel;
        this.type = type;
        this.body = body;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write("var ");
        writer.write(escapeReservedKeyword(this.unsafeName));
        writer.write(": ");
        this.type.write(writer);
        writer.write(" ");
        if (this.body instanceof CodeBlock) {
            this.body.write(writer);
        } else if (this.body instanceof Expression) {
            const codeBlock = CodeBlock.withStatements([Statement.expressionStatement(this.body)]);
            codeBlock.write(writer);
        } else {
            assertNever(this.body);
        }
    }
}
