import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Method } from "./Method";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Enum {
    interface Args {
        /* The name of the PHP enum */
        name: string;
        /* The namespace of the PHP enum*/
        namespace: string;
        /* If present, specifies that the enum is backed by this type */
        backing?: "string" | "int";
        /* Docs associated with the class */
        docs?: string;
        /* Whether the class should implement the JsonSerializable interface */
        serializable?: boolean;
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
    public readonly serializable: boolean;

    constructor({ name, namespace, backing, docs, serializable }: Enum.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.backing = backing;
        this.docs = docs;
        this.serializable = serializable ?? false;
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
        if (this.serializable) {
            writer.addReference(
                new ClassReference({
                    name: "JsonSerializable",
                    namespace: ""
                })
            );
            writer.writeLine(" implements JsonSerializable");
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
        if (this.serializable) {
            writer.newLine();
            writer.writeNode(
                new Method({
                    name: "jsonSerialize",
                    return_: Type.string(),
                    access: "public",
                    parameters: [],
                    body: new CodeBlock("return $this->value;")
                })
            );
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
