export class LocalSymbolRegistry {
    private static readonly reservedSymbols = ["CodingKeys"];

    public static create(): LocalSymbolRegistry {
        return new LocalSymbolRegistry(LocalSymbolRegistry.reservedSymbols);
    }

    private stringLiteralEnumSymbols: Map<string, string>;

    private readonly symbolSet: Set<string>;

    private constructor(symbols: string[]) {
        this.stringLiteralEnumSymbols = new Map();
        this.symbolSet = new Set(symbols);
    }

    public getStringLiteralSymbolOrThrow(literalValue: string): string {
        const symbol = this.stringLiteralEnumSymbols.get(literalValue);
        if (symbol == null) {
            throw new Error(`String literal symbol not found for literal value "${literalValue}"`);
        }
        return symbol;
    }

    public registerStringLiteralSymbolIfNotExists(nameCandidatePascalCase: string, literalValue: string): string {
        let symbolName = this.stringLiteralEnumSymbols.get(literalValue);
        if (symbolName != null) {
            return symbolName;
        }
        symbolName = this.getAvailableSymbolName([
            nameCandidatePascalCase,
            `${nameCandidatePascalCase}Literal`,
            `${nameCandidatePascalCase}Enum`,
            `${nameCandidatePascalCase}LiteralType`,
            `${nameCandidatePascalCase}EnumType`
        ]);
        this.stringLiteralEnumSymbols.set(literalValue, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    private getAvailableSymbolName(candidates: [string, ...string[]]): string {
        for (const name of candidates) {
            if (!this.exists(name)) {
                return name;
            }
        }
        let [name] = candidates;
        while (this.exists(name)) {
            name += "_";
        }
        return name;
    }

    public exists(symbolName: string): boolean {
        return this.symbolSet.has(symbolName);
    }
}
