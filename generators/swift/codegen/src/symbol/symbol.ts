import { FoundationTypeSymbolName, SwiftTypeSymbolName } from "../ast";

export class Symbol {
    public static readonly SWIFT_SYMBOL_NAME = "Swift";
    public static readonly SWIFT_SYMBOL_ID = Symbol.SWIFT_SYMBOL_NAME;
    public static readonly FOUNDATION_SYMBOL_NAME = "Foundation";
    public static readonly FOUNDATION_SYMBOL_ID = Symbol.FOUNDATION_SYMBOL_NAME;

    public static isSwiftSymbol(symbolId: string): boolean {
        return Symbol.SWIFT_SYMBOL_ID === symbolId || symbolId.startsWith(`${Symbol.SWIFT_SYMBOL_ID}.`);
    }

    public static isFoundationSymbol(symbolId: string): boolean {
        return Symbol.FOUNDATION_SYMBOL_ID === symbolId || symbolId.startsWith(`${Symbol.FOUNDATION_SYMBOL_ID}.`);
    }

    /**
     * Any non-system symbol.
     */
    public static isCustomSymbol(symbolId: string): boolean {
        return !Symbol.isSwiftSymbol(symbolId) && !Symbol.isFoundationSymbol(symbolId);
    }

    public static create(symbolId: string, symbolName: string): Symbol {
        return new Symbol(symbolId, symbolName);
    }

    public static swiftType(symbolName: SwiftTypeSymbolName): Symbol {
        return Symbol.create(`${Symbol.SWIFT_SYMBOL_ID}.${symbolName}`, symbolName);
    }

    public static foundationType(symbolName: FoundationTypeSymbolName): Symbol {
        return Symbol.create(`${Symbol.FOUNDATION_SYMBOL_ID}.${symbolName}`, symbolName);
    }

    public readonly id: string;
    public readonly name: string;

    private constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
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
