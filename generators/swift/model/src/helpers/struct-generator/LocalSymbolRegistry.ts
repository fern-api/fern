import { assertDefined, SymbolRegistry } from "@fern-api/core-utils";

export class LocalSymbolRegistry {
    private static readonly reservedSymbols = ["CodingKeys"];

    public static create(): LocalSymbolRegistry {
        return new LocalSymbolRegistry(LocalSymbolRegistry.reservedSymbols);
    }

    private stringLiteralEnumsRegistry: SymbolRegistry;

    private constructor(reservedSymbolNames: string[]) {
        this.stringLiteralEnumsRegistry = new SymbolRegistry({ reservedSymbolNames });
    }

    public getStringLiteralSymbolOrThrow(literalValue: string): string {
        const symbol = this.stringLiteralEnumsRegistry.getSymbolNameById(literalValue);
        assertDefined(symbol, `String literal symbol not found for literal value "${literalValue}"`);
        return symbol;
    }

    public registerStringLiteralSymbolIfNotExists(nameCandidatePascalCase: string, literalValue: string): string {
        let symbolName = this.stringLiteralEnumsRegistry.getSymbolNameById(literalValue);
        if (symbolName != null) {
            return symbolName;
        }
        return this.stringLiteralEnumsRegistry.registerSymbol(literalValue, [
            nameCandidatePascalCase,
            `${nameCandidatePascalCase}Literal`,
            `${nameCandidatePascalCase}Enum`,
            `${nameCandidatePascalCase}LiteralType`,
            `${nameCandidatePascalCase}EnumType`
        ]);
    }
}
