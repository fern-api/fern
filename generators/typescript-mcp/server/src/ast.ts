import { ts } from "@fern-api/typescript-ast";

import { SdkRequest } from "@fern-fern/ir-sdk/api";

export function sdkRequestMapper(sdkRequest?: SdkRequest) {
    return sdkRequest?.shape._visit({
        justRequestBody: (value) =>
            value._visit({
                typeReference: (value) =>
                    value.requestBodyType._visit({
                        container: () => undefined,
                        named: (value) => value,
                        primitive: () => undefined,
                        unknown: () => undefined,
                        _other: () => undefined
                    }),
                bytes: () => undefined,
                _other: () => undefined
            }),
        wrapper: () => undefined,
        _other: () => undefined
    });
}

interface ObjectLiteralField {
    name: string;
    value: ts.AstNode;
}

export declare namespace ObjectLiteralNode {
    interface Args {
        fields: ObjectLiteralField[];
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ObjectLiteralNode extends ts.AstNode {
    public constructor(private readonly args: ObjectLiteralNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.write("{");
        writer.newLine();
        writer.indent();
        for (const field of this.args.fields) {
            writer.write(`${field.name}: `);
            writer.writeNode(field.value);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }
}

export declare namespace ParameterNode {
    interface Args {
        name: string;
        type?: ts.AstNode;
        docs?: string;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ParameterNode extends ts.AstNode {
    constructor(private readonly args: ParameterNode.Args) {
        super();
    }

    public write(writer: ts.Writer): void {
        if (this.args.docs != null) {
            writer.writeNode(new ts.Comment({ docs: this.args.docs }));
        }
        writer.write(this.args.name);
        if (this.args.type) {
            writer.write(": ");
            this.args.type.write(writer);
        }
    }
}

export declare namespace FunctionNode {
    interface Args {
        name?: string;
        parameters: ParameterNode[];
        body: ts.CodeBlock;
        return_?: ts.Type;
        async?: boolean;
        docs?: string;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class FunctionNode extends ts.AstNode {
    readonly async: boolean;

    constructor(private readonly args: FunctionNode.Args) {
        super();
        this.async = args.async ?? false;
    }

    public write(writer: ts.Writer): void {
        writer.writeNode(new ts.Comment({ docs: this.args.docs }));
        if (this.async) {
            writer.write("async ");
        }
        writer.write("function ");
        if (this.args.name) {
            writer.write(`${this.args.name}`);
        }
        this.writeParameters(writer);
        if (this.args.return_ != null) {
            writer.write(": ");
            writer.writeNode(this.async ? ts.Type.promise(this.args.return_) : this.args.return_);
        }
        writer.writeLine(" {");
        writer.indent();
        this.args.body.write(writer);
        writer.dedent();
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("}");
    }

    private writeParameters(writer: ts.Writer): void {
        if (this.args.parameters.length === 0) {
            writer.write("()");
            return;
        }
        writer.indent();
        writer.writeLine("(");
        for (const parameter of this.args.parameters) {
            writer.writeNode(parameter);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write(")");
    }
}

export declare namespace MethodInvocationNode {
    interface Args {
        on: ts.AstNode;
        method: string;
        arguments_: ts.AstNode[];
        async?: boolean;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class MethodInvocationNode extends ts.AstNode {
    constructor(private readonly args: MethodInvocationNode.Args) {
        super();
    }

    public write(writer: ts.Writer): void {
        if (this.args.async) {
            writer.write("await ");
        }
        this.args.on.write(writer);
        writer.write(".");
        writer.write(this.args.method);
        writer.write("(");
        writer.delimit({
            nodes: this.args.arguments_,
            delimiter: ", ",
            writeFunction: (argument) => argument.write(writer)
        });
        writer.write(")");
    }
}
