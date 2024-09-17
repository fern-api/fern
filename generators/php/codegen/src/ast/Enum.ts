import { Comment } from "./Comment";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Enum {
    interface Args {
        /* The name of the PHP enum */
        name: string;
        /* The namespace of the PHP enum*/
        namespace: string;
        /* If present, specified that the enum is backed by this type */
        backing?: "string" | "int";
        /* Docs associated with the class */
        docs?: string;
    }

    interface Member {
        /* The name of the enum field */
        name: string;
        /* The value of the enum field */
        value?: string | number;
    }
}

export class Enum extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly backing: "string" | "int" | undefined;
    public readonly docs: string | undefined;
    public readonly members: Enum.Member[] = [];

    constructor({ name, namespace, backing, docs }: Enum.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.backing = backing;
        this.docs = docs;
    }

    public addMember(member: Enum.Member): void {
        this.members.push(member);
    }

    public write(writer: Writer): void {
        this.writeComment(writer);
        writer.write("enum ");
        writer.writeLine(`${this.name}`);
        if (this.backing != null) {
            writer.write(` : ${this.backing}`);
        }
        writer.writeLine(" {");

        writer.indent();
        for (const member of this.members) {
            writer.write(`case ${member.name}`);
            if (member.value != null) {
                if (typeof member.value === "string") {
                    writer.write(` = "${member.value}"`);
                } else {
                    writer.write(` = ${member.value}`);
                }
            }
            writer.writeTextStatement("");
        }
        writer.writeNewLineIfLastLineNot();
        writer.dedent();
        writer.writeLine("}");
    }

    public writeComment(writer: Writer): void {
        if (this.docs == null) {
            return undefined;
        }
        const comment = new Comment({ docs: this.docs });
        comment.write(writer);
    }
}
