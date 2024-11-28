import { Comment } from "./Comment";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Enum {
    interface Args {
        /* The name of the Go enum */
        name: string;
        /* The docs of the Go enum, if any */
        docs?: string;
    }

    interface Member {
        /* The name of the enum field */
        name: string;
        /* The value of the enum field */
        value: string;
    }
}

export class Enum extends AstNode {
    public readonly name: string;
    public readonly docs: string | undefined;
    public readonly members: Enum.Member[] = [];

    constructor({ name, docs }: Enum.Args) {
        super();
        this.name = name;
        this.docs = docs;
    }

    public addMember(member: Enum.Member): void {
        this.members.push(member);
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write(`type ${this.name} string`);

        // TODO: Generate constant member values.
        // TODO: Generate constructor.
        // TODO: Generate Ptr method.
    }
}
