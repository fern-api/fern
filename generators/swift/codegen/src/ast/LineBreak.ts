import { AstNode, Writer } from "./core";

export declare namespace LineBreak {
    interface Args {
        /** Number of line breaks to insert (default: 1) */
        count?: number;
    }
}

/**
 * An AST node for representing line breaks and spacing in Swift files.
 * Can be used as a building block when composing files.
 */
export class LineBreak extends AstNode {
    private readonly count: number;

    public constructor({ count = 1 }: LineBreak.Args = {}) {
        super();
        this.count = count;
    }

    public write(writer: Writer): void {
        for (let i = 0; i < this.count; i++) {
            writer.newLine();
        }
    }

    public static single(): LineBreak {
        return new LineBreak({ count: 1 });
    }

    public static double(): LineBreak {
        return new LineBreak({ count: 2 });
    }

    public static multiple(count: number): LineBreak {
        return new LineBreak({ count });
    }
}
