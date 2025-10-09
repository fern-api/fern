import { escapeReservedKeyword } from "../syntax";
import { AccessLevel } from "./AccessLevel";
import { CodeBlock } from "./CodeBlock";
import { AstNode, Writer } from "./core";
import { DocComment } from "./DocComment";
import { Expression } from "./Expression";
import { FunctionArgument } from "./FunctionArgument";
import { FunctionParameter } from "./FunctionParameter";
import { TypeReference } from "./TypeReference";

export declare namespace Method {
    interface Attribute {
        name: string;
        arguments?: FunctionArgument[];
    }

    interface Args {
        attributes?: Attribute[];
        unsafeName: string;
        accessLevel?: AccessLevel;
        static_?: boolean;
        parameters?: FunctionParameter[];
        async?: true;
        throws?: true;
        returnType: TypeReference;
        body?: CodeBlock;
        docs?: DocComment;
    }
}

export class Method extends AstNode {
    public readonly attributes: Method.Attribute[];
    public readonly unsafeName: string;
    public readonly accessLevel?: AccessLevel;
    public readonly static_?: boolean;
    public readonly parameters: FunctionParameter[];
    public readonly async?: true;
    public readonly throws?: true;
    public readonly returnType: TypeReference;
    public readonly body: CodeBlock;
    public readonly docs?: DocComment;

    public constructor({
        attributes,
        unsafeName,
        accessLevel,
        static_,
        parameters,
        async,
        throws,
        returnType,
        body,
        docs
    }: Method.Args) {
        super();
        this.attributes = attributes ?? [];
        this.unsafeName = unsafeName;
        this.accessLevel = accessLevel;
        this.static_ = static_;
        this.parameters = parameters ?? [];
        this.async = async;
        this.throws = throws;
        this.returnType = returnType;
        this.body = body ?? CodeBlock.empty();
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        this.attributes.forEach((attribute) => {
            if (attribute.arguments?.length) {
                Expression.functionCall({
                    unsafeName: `@${attribute.name}`,
                    arguments_: attribute.arguments
                }).write(writer);
            } else {
                writer.write("@");
                writer.write(attribute.name);
            }
            writer.write(" ");
        });
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        if (this.static_) {
            writer.write("static ");
        }
        writer.write("func ");
        writer.write(escapeReservedKeyword(this.unsafeName));
        writer.write("(");
        this.parameters.forEach((parameter, parameterIdx) => {
            if (parameterIdx > 0) {
                writer.write(", ");
            }
            parameter.write(writer);
        });
        writer.write(")");
        if (this.async) {
            writer.write(" async");
        }
        if (this.throws) {
            writer.write(" throws");
        }
        writer.write(" -> ");
        this.returnType.write(writer);
        writer.write(" ");
        this.body.write(writer);
    }
}
