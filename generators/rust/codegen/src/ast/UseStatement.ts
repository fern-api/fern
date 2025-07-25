import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export declare namespace UseStatement {
    interface Args {
        path: string;
        items?: string[];
        isPublic?: boolean;
    }
}

export class UseStatement extends AstNode {
    private readonly path: string;
    private readonly items?: string[];
    private readonly isPublic: boolean;

    constructor({ path, items, isPublic = false }: UseStatement.Args) {
        super();
        this.path = path;
        this.items = items;
        this.isPublic = isPublic;
    }

    public write(writer: Writer): void {
        if (this.isPublic) {
            writer.write("pub ");
        }
        
        writer.write("use ");
        writer.write(this.path);
        
        if (this.items && this.items.length > 0) {
            writer.write("::{");
            this.items.forEach((item, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.write(item);
            });
            writer.write("}");
        }
        
        writer.write(";");
    }
} 