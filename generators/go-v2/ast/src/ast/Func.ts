import { CodeBlock } from "./CodeBlock";
import { Method } from "./Method";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Func {
    type Args = Omit<Method.Args, "typeReference">;
}

export class Func extends AstNode {
    private func: Method;

    constructor({ name, parameters, return_, body, docs }: Func.Args) {
        super();
        this.func = new Method({ name, parameters, return_, body, docs });
    }

    public get name(): string {
        return this.func.name;
    }

    public get parameters(): Parameter[] {
        return this.func.parameters;
    }

    public get return_(): Type[] {
        return this.func.return_;
    }

    public get body(): CodeBlock | undefined {
        return this.func.body;
    }

    public get docs(): string | undefined {
        return this.func.docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.func);
    }
}
