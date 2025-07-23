import { TypeInstantiation } from "./TypeInstantiation";
import { Comment } from "./Comment";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Method } from "./Method";
import { Func } from "./Func";
import { Identifier } from "./Identifier";

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
        /* The docs of the Go enum member, if any */
        docs?: string;
    }
}

export class Enum extends AstNode {
    public readonly name: string;
    public readonly docs: string | undefined;
    public readonly members: Enum.Member[] = [];
    public readonly methods: Method[] = [];

    private constructor_: Func | undefined;

    constructor({ name, docs }: Enum.Args) {
        super();
        this.name = name;
        this.docs = docs;
    }

    public addConstructor(constructor_: Func): void {
        this.constructor_ = constructor_;
    }

    public addMember(member: Enum.Member): void {
        this.members.push(member);
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public write(writer: Writer): void {
        this.writeType({ writer });
        this.writeMembers({ writer });
        this.writeConstructor({ writer });
        this.writeMethods({ writer });
    }

    private writeType({ writer }: { writer: Writer }): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.writeLine(`type ${this.name} string`);
    }

    private writeMembers({ writer }: { writer: Writer }): void {
        if (this.members.length === 0) {
            return;
        }
        writer.newLine();
        writer.writeLine("const (");
        writer.indent();
        for (const member of this.members) {
            writer.writeNode(new Comment({ docs: member.docs }));
            writer.writeNode(Enum.getMemberIdentifier({ name: this.name, member }));
            writer.write(" = ");
            writer.writeNode(TypeInstantiation.string(member.value));
            writer.newLine();
        }
        writer.dedent();
        writer.write(")");
    }

    private writeConstructor({ writer }: { writer: Writer }): void {
        if (this.constructor_ == null) {
            return;
        }
        writer.newLine();
        writer.writeNode(this.constructor_);
    }

    private writeMethods({ writer }: { writer: Writer }): void {
        writer.newLine();
        for (const method of this.methods) {
            writer.newLine();
            writer.writeNode(method);
            writer.newLine();
        }
    }

    public static getMemberIdentifier({ name, member }: { name: string; member: Enum.Member }): Identifier {
        return new Identifier({ name: `${name}${member.name}` });
    }
}
