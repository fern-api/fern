import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Assert {
    interface Args {
        test: AstNode;
        msg?: AstNode;
    }
}

export class Assert extends AstNode {
    private readonly test: AstNode;
    private readonly msg?: AstNode;

    constructor({ test, msg }: Assert.Args) {
        super();

        this.test = test;
        this.inheritReferences(test);

        if (msg) {
            this.msg = msg;
            this.inheritReferences(msg);
        }
    }

    public write(writer: Writer): void {
        writer.write("assert ");
        this.test.write(writer);

        if (this.msg) {
            writer.write(", ");
            this.msg.write(writer);
        }
    }
}
