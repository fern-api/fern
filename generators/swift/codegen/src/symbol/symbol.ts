import { TypeSymbolShape } from "./symbol-registry";

export type SwiftTypeSymbolName =
    | "String"
    | "Bool"
    | "Int"
    | "Int64"
    | "UInt"
    | "UInt64"
    | "Float"
    | "Double"
    | "Void"
    | "Encoder"
    | "Decoder"
    // TODO(kafkas): Any doesn't seem to be under the Swift scope i.e. Swift.Any is not valid so we probably wanna move this.
    | "Any";

export type FoundationTypeSymbolName = "Data" | "Date" | "URLSession" | "UUID";

export class Symbol {
    public static readonly SWIFT_SYMBOL_NAME = "Swift";
    public static readonly SWIFT_SYMBOL_ID = Symbol.SWIFT_SYMBOL_NAME;

    private static swiftTypeSymbolsByName: Record<SwiftTypeSymbolName, Symbol> = {
        String: Symbol.swiftType("String"),
        Bool: Symbol.swiftType("Bool"),
        Int: Symbol.swiftType("Int"),
        Int64: Symbol.swiftType("Int64"),
        UInt: Symbol.swiftType("UInt"),
        UInt64: Symbol.swiftType("UInt64"),
        Float: Symbol.swiftType("Float"),
        Double: Symbol.swiftType("Double"),
        Void: Symbol.swiftType("Void"),
        Encoder: Symbol.swiftType("Encoder"),
        Decoder: Symbol.swiftType("Decoder"),
        Any: Symbol.swiftType("Any")
    };
    public static swiftTypeSymbols = Object.values(Symbol.swiftTypeSymbolsByName);

    public static readonly FOUNDATION_SYMBOL_NAME = "Foundation";
    public static readonly FOUNDATION_SYMBOL_ID = Symbol.FOUNDATION_SYMBOL_NAME;

    private static foundationTypeSymbolsByName: Record<FoundationTypeSymbolName, Symbol> = {
        Data: Symbol.foundationType("Data"),
        Date: Symbol.foundationType("Date"),
        URLSession: Symbol.foundationType("URLSession"),
        UUID: Symbol.foundationType("UUID")
    };
    public static foundationTypeSymbols = Object.values(Symbol.foundationTypeSymbolsByName);

    public static isSwiftSymbol(symbolId: string): boolean {
        return Symbol.SWIFT_SYMBOL_ID === symbolId || symbolId.startsWith(`${Symbol.SWIFT_SYMBOL_ID}.`);
    }

    public static isSwiftSymbolName(symbolName: string): symbolName is SwiftTypeSymbolName {
        return symbolName in Symbol.swiftTypeSymbolsByName;
    }

    public static isFoundationSymbol(symbolId: string): boolean {
        return Symbol.FOUNDATION_SYMBOL_ID === symbolId || symbolId.startsWith(`${Symbol.FOUNDATION_SYMBOL_ID}.`);
    }

    public static isFoundationSymbolName(symbolName: string): symbolName is FoundationTypeSymbolName {
        return symbolName in Symbol.foundationTypeSymbolsByName;
    }

    /**
     * Any non-system symbol.
     */
    public static isCustomSymbol(symbolId: string): boolean {
        return !Symbol.isSwiftSymbol(symbolId) && !Symbol.isFoundationSymbol(symbolId);
    }

    public static create(symbolId: string, symbolName: string, shape: TypeSymbolShape): Symbol {
        return new Symbol(symbolId, symbolName, shape);
    }

    public static swiftType(symbolName: SwiftTypeSymbolName): Symbol {
        return Symbol.create(`${Symbol.SWIFT_SYMBOL_ID}.${symbolName}`, symbolName, { type: "system" });
    }

    public static foundationType(symbolName: FoundationTypeSymbolName): Symbol {
        return Symbol.create(`${Symbol.FOUNDATION_SYMBOL_ID}.${symbolName}`, symbolName, { type: "system" });
    }

    public readonly id: string;
    public readonly name: string;
    public readonly shape: TypeSymbolShape;

    private constructor(id: string, name: string, shape: TypeSymbolShape) {
        this.id = id;
        this.name = name;
        this.shape = shape;
    }

    public get isSwiftSymbol(): boolean {
        return Symbol.isSwiftSymbol(this.id);
    }

    public get isFoundationSymbol(): boolean {
        return Symbol.isFoundationSymbol(this.id);
    }

    public get isCustomSymbol(): boolean {
        return Symbol.isCustomSymbol(this.id);
    }
}
