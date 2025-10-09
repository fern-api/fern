import { AstNode, Writer } from "./core";
import { FoundationTypeSymbolName, SwiftTypeSymbolName } from "./Type";

export declare namespace SymbolReference {
    interface Args {
        reference: string;
        optional?: true;
        genericArguments?: SymbolReference[];
    }
}

// TODO(kafkas): Remove this?
export class SymbolReference extends AstNode {
    /**
     * Can be fully qualified or just the symbol name (e.g., "MyClass").
     */
    private readonly reference: string;
    private readonly optional?: true;
    private readonly genericArguments: SymbolReference[];

    public constructor(args: SymbolReference.Args) {
        super();
        this.reference = args.reference;
        this.genericArguments = args.genericArguments ?? [];
    }

    public write(writer: Writer): void {
        writer.write(this.reference);
        if (this.optional) {
            writer.write("?");
        }
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

    public static create(name: string): SymbolReference {
        return new SymbolReference({ reference: name });
    }

    public static createFromParts(parts: string[]): SymbolReference {
        return new SymbolReference({ reference: parts.join(".") });
    }

    public static unqualifiedSwiftType(swiftType: SwiftTypeSymbolName): SymbolReference {
        return new SymbolReference({ reference: swiftType });
    }

    public static unqualifiedFoundationType(foundationType: FoundationTypeSymbolName): SymbolReference {
        return new SymbolReference({ reference: foundationType });
    }

    public static dictionary(keyType: SymbolReference, valueType: SymbolReference): SymbolReference {
        const rawRef = `[${keyType.toString()}: ${valueType.toString()}]`;
        return new SymbolReference({ reference: rawRef });
    }
}
