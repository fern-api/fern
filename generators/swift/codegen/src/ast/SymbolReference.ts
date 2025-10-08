import { AstNode, Writer } from "./core";

export declare namespace SymbolReference {
    interface Args {
        name: string;
        genericArguments?: SymbolReference[];
    }
}

export class SymbolReference extends AstNode {
    /**
     * Can be fully qualified or just the symbol name (e.g., "MyClass").
     */
    public readonly name: string;
    public readonly genericArguments: SymbolReference[];

    public static fromName(name: string): SymbolReference {
        return new SymbolReference({ name });
    }

    public static fromParts(parts: string[]): SymbolReference {
        return new SymbolReference({ name: parts.join(".") });
    }

    public constructor(args: SymbolReference.Args) {
        super();
        this.name = args.name;
        this.genericArguments = args.genericArguments ?? [];
    }

    public write(writer: Writer): void {
        writer.write(this.name);
        if (this.genericArguments.length > 0) {
            writer.write("<");
            this.genericArguments.forEach((arg, index) => {
                arg.write(writer);
                if (index < this.genericArguments.length - 1) {
                    writer.write(", ");
                }
            });
            writer.write(">");
        }
    }
}
