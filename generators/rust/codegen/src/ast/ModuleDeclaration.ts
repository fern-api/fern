import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export declare namespace ModuleDeclaration {
    interface Args {
        name: string;
        isPublic?: boolean;
    }
}

export class ModuleDeclaration extends AstNode {
    private readonly name: string;
    private readonly isPublic: boolean;

    constructor({ name, isPublic = false }: ModuleDeclaration.Args) {
        super();
        this.name = name;
        this.isPublic = isPublic;
    }

    public write(writer: Writer): void {
        if (this.isPublic) {
            writer.write("pub ");
        }

        writer.write("mod ");
        writer.write(this.name);
        writer.write(";");
    }
}
