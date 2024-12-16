import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Comment } from "./Comment";

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
        /* Reference to the parent enum */
        parent: Enum | undefined;
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
        member.parent = this;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write(`enum ${this.name} {`);
        writer.indent();
        let i = 0;
        for (const member of this.members) {
            i++;
            if (member.value !== undefined) {
                writer.write(`${member.name} = ${member.value}`);
            } else {
                writer.write(`${member.name}`);
            }
            writer.writeLine(i < this.members.length ? "," : "");
        }
        writer.dedent();
        writer.writeLine("}");
        writer.writeNewLineIfLastLineNot();
    }
}
