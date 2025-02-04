import { LambdaParameter } from "./LambdaParameter";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Lambda {
    interface Args {
        /* The parameter names of the lambda */
        parameters?: LambdaParameter[];
        /* The body of the lambda */
        body: AstNode;
    }
}

export class Lambda extends AstNode {
    private readonly parameters: LambdaParameter[];
    private readonly body: AstNode;

    constructor({ parameters, body }: Lambda.Args) {
        super();
        this.parameters = parameters ?? [];
        this.body = body;

        this.inheritReferences(body);
    }

    public write(writer: Writer): void {
        writer.write("lambda");

        if (this.parameters && this.parameters.length) {
            writer.write(" ");
            this.parameters.forEach((param, index) => {
                param.write(writer);
                if (index < this.parameters.length - 1) {
                    writer.write(", ");
                }
            });
        }
        writer.write(": ");
        this.body.write(writer);
    }
}
