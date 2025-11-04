import { Writer } from "../core/Writer";
import { CodeBlock } from "./CodeBlock";
import { Parameter } from "./Parameter";

export declare namespace AnonymousFunction {
    interface Args {
        /* Whether the method is sync or async. Defaults to false. */
        isAsync?: boolean;
        /* The parameters of the method */
        parameters: Parameter[];
        /* The body of the method */
        body: CodeBlock;
    }
}

export class AnonymousFunction {
    private readonly isAsync: boolean;
    private readonly parameters: Parameter[];
    private readonly body: CodeBlock;
    constructor(methodBaseArgs: AnonymousFunction.Args) {
        this.isAsync = methodBaseArgs.isAsync ?? false;
        this.parameters = methodBaseArgs.parameters;
        this.body = methodBaseArgs.body;
    }

    public write(writer: Writer): void {
        if (this.isAsync) {
            writer.write("async ");
        }
        writer.write("(");
        this.parameters.forEach((parameter, idx) => {
            parameter.write(writer);
            if (idx < this.parameters.length - 1) {
                writer.write(", ");
            }
        });
        writer.writeLine(") =>");

        writer.pushScope();
        this.body?.write(writer);
        writer.popScope();
    }
}
