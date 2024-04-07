import { CodeBlock } from "../CodeBlock";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Method } from "../Method";
import { MethodInvocation } from "../MethodInvocation";
import { RootClient } from "./RootClient";

export declare namespace Snippet {
    interface Args {
        /* The base client from which all calls are generated */
        rootClient: RootClient;
        // TODO(abelardo): Make it so you can go from endpoint id to method easily
        /* The method associated with the endpoint you'd like to invoke */
        method: Method;
        /* The example data with which to populate the snippet */
        example: Map<string, unknown>;
    }
}

export class Snippet extends AstNode {
    public readonly methodInvocation: MethodInvocation;

    constructor({ rootClient, method, example }: Snippet.Args) {
        super();
        this.methodInvocation = method.getInvocationFromExample(example, new CodeBlock({ value: rootClient.name }));
    }

    public write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
