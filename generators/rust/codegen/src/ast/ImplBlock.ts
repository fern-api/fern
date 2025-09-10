import { AstNode } from "./AstNode";
import { Attribute } from "./Attribute";
import { Method } from "./Method";
import { Type } from "./Type";
import { Writer } from "./Writer";

export declare namespace ImplBlock {
    interface Args {
        targetType: Type;
        attributes?: Attribute[];
        methods: Method[];
        traitName?: string;
    }
}

export class ImplBlock extends AstNode {
    public readonly targetType: Type;
    public readonly attributes?: Attribute[];
    public readonly methods: Method[];
    public readonly traitName?: string;

    public constructor({ targetType, attributes, methods, traitName }: ImplBlock.Args) {
        super();
        this.targetType = targetType;
        this.attributes = attributes;
        this.methods = methods;
        this.traitName = traitName;
    }

    public write(writer: Writer): void {
        // Write attributes above the impl block
        if (this.attributes && this.attributes.length > 0) {
            this.attributes.forEach((attribute) => {
                attribute.write(writer);
                writer.newLine();
            });
        }

        // Write impl declaration
        writer.write("impl ");

        if (this.traitName) {
            writer.write(`${this.traitName} for `);
        }

        this.targetType.write(writer);
        writer.write(" {");
        writer.newLine();

        // Write methods
        this.methods.forEach((method, index) => {
            if (index > 0) {
                writer.newLine();
            }
            method.write(writer);
            writer.newLine();
        });

        writer.write("}");
    }
}
