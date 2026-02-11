import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Method } from "./Method.js";
import { Parameter } from "./Parameter.js";
import { Type } from "./Type.js";

export declare namespace Func {
    type Args = Omit<Method.Args, "typeReference">;
}

export class Func extends AstNode {
    private func: Method;

    constructor({ name, parameters, return_, body, docs, multiline }: Func.Args) {
        super();
        this.func = new Method({ name, parameters, return_, body, docs, multiline });
    }

    public get parameters(): Parameter[] {
        return this.func.parameters;
    }

    public get return_(): Type[] {
        return this.func.return_;
    }

    public get name(): string | undefined {
        return this.func.name;
    }

    public get body(): AstNode | undefined {
        return this.func.body;
    }

    public get docs(): string | undefined {
        return this.func.docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.func);
    }
}
