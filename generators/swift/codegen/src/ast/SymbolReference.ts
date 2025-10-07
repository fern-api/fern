import { AstNode, Writer } from "./core";

const SwiftType = {
    String: {
        type: "string",
        symbolName: "String"
    },
    Bool: {
        type: "bool",
        symbolName: "Bool"
    },
    Int: {
        type: "int",
        symbolName: "Int"
    },
    Int64: {
        type: "int64",
        symbolName: "Int64"
    },
    UInt: {
        type: "uint",
        symbolName: "UInt"
    },
    UInt64: {
        type: "uint64",
        symbolName: "UInt64"
    },
    Float: {
        type: "float",
        symbolName: "Float"
    },
    Double: {
        type: "double",
        symbolName: "Double"
    },
    Void: {
        type: "void",
        symbolName: "Void"
    },
    Any: {
        type: "any",
        symbolName: "Any"
    }
} as const;

type SwiftType = (typeof SwiftType)[keyof typeof SwiftType];

export const FoundationType = {
    Data: {
        type: "data",
        symbolName: "Data"
    },
    Date: {
        type: "date",
        symbolName: "Date"
    },
    UUID: {
        type: "uuid",
        symbolName: "UUID"
    }
} as const;

export type FoundationType = (typeof FoundationType)[keyof typeof FoundationType];

export declare namespace SymbolReference {
    interface Args {
        name: string;
        genericArguments?: SymbolReference[];
    }
}

export class SymbolReference extends AstNode {
    public static readonly swiftSymbolId = "Swift";
    public static readonly foundationSymbolId = "Foundation";
    public static readonly moduleSymbolId = "Module";

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

    public static swiftTypeSymbolId(type: keyof typeof SwiftType): string {
        const t = SwiftType[type];
        return `${SymbolReference.swiftSymbolId}:${t.symbolName}`;
    }

    public static foundationTypeSymbolId(type: keyof typeof FoundationType): string {
        const t = FoundationType[type];
        return `${SymbolReference.foundationSymbolId}:${t.symbolName}`;
    }

    public static moduleTypeSymbolId(typeName: string): string {
        return `${SymbolReference.moduleSymbolId}:${typeName}`;
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
