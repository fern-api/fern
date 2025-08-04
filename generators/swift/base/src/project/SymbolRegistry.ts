import { AsIsFiles } from "../AsIs";

export class SymbolRegistry {
    /**
     * The list of Swift symbols that the generator reserves. We only reserve the symbols that
     * are used internally within the generated code. This means that when the user defines a
     * `KeyPath` type (a built-in type), for example, it will be their responsibility to use
     * `Swift.KeyPath` in their code to disambiguate it from the custom type.
     */
    private static readonly reservedSwiftSymbols = [
        "Any",
        "Bool",
        "Double",
        "Float",
        "Int",
        "Int64",
        "String",
        "UInt",
        "UInt64",
        "Void"
    ];

    private static readonly reservedFoundationSymbols = ["Data", "Date", "UUID"];

    private static readonly reservedSymbols = [
        "Swift",
        "Foundation",
        ...SymbolRegistry.reservedSwiftSymbols,
        ...SymbolRegistry.reservedFoundationSymbols
    ];

    public static create(): SymbolRegistry {
        const registry = new SymbolRegistry(SymbolRegistry.reservedSymbols);
        Object.values(AsIsFiles).forEach((definition) => {
            definition.symbolNames.forEach((symbolName) => {
                registry.registerAsIsSymbol(symbolName);
            });
        });
        return registry;
    }

    private rootClientSymbol: string | null;
    private environmentSymbol: string | null;
    private subClientSymbols: Map<string, string>;
    private schemaTypeSymbols: Map<string, string>;
    private inlineRequestTypeSymbols: Map<string, string>;

    private readonly symbolSet: Set<string>;

    private constructor(symbols: string[]) {
        this.rootClientSymbol = null;
        this.environmentSymbol = null;
        this.subClientSymbols = new Map();
        this.schemaTypeSymbols = new Map();
        this.inlineRequestTypeSymbols = new Map();
        this.symbolSet = new Set(symbols);
    }

    public getRootClientSymbolOrThrow(): string {
        const symbol = this.rootClientSymbol;
        if (symbol == null) {
            throw new Error("Root client symbol not found.");
        }
        return symbol;
    }

    public getEnvironmentSymbolOrThrow(): string {
        const symbol = this.environmentSymbol;
        if (symbol == null) {
            throw new Error("Environment symbol not found.");
        }
        return symbol;
    }

    public getSubClientSymbolOrThrow(subpackageId: string): string {
        const symbol = this.subClientSymbols.get(subpackageId);
        if (symbol == null) {
            throw new Error(`Subclient symbol not found for subpackage ${subpackageId}`);
        }
        return symbol;
    }

    public getSchemaTypeSymbolOrThrow(typeId: string): string {
        const symbol = this.schemaTypeSymbols.get(typeId);
        if (symbol == null) {
            throw new Error(`Schema type symbol not found for type ${typeId}`);
        }
        return symbol;
    }

    public getInlineRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): string {
        const id = this.getRequestTypeSymbolId(endpointId, requestNamePascalCase);
        const symbol = this.inlineRequestTypeSymbols.get(id);
        if (symbol == null) {
            throw new Error(`Request symbol not found for request ${requestNamePascalCase}`);
        }
        return symbol;
    }

    public registerAsIsSymbol(symbolName: string): void {
        this.symbolSet.add(symbolName);
    }

    public registerRootClientSymbol(symbolName: string): string {
        // TODO(kafkas): Use fallback candidates to produce better names
        symbolName = this.getAvailableSymbolName(symbolName);
        this.rootClientSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerEnvironmentSymbol(symbolName: string): string {
        // TODO(kafkas): Use fallback candidates to produce better names
        symbolName = this.getAvailableSymbolName(symbolName);
        this.environmentSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerSubClientSymbol(subpackageId: string, parentNames: string[], symbolName: string): string {
        const reversedParts = parentNames.toReversed();
        reversedParts.shift();
        const fallbackCandidates = reversedParts.map(
            (_, partIdx) =>
                reversedParts
                    .slice(0, partIdx + 1)
                    .reverse()
                    .join("") + symbolName
        );
        symbolName = this.getAvailableSymbolName(symbolName, fallbackCandidates);
        this.subClientSymbols.set(subpackageId, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerSchemaTypeSymbol(typeId: string, symbolName: string): string {
        symbolName = this.getAvailableSymbolName(symbolName, [`${symbolName}Type`, `${symbolName}Model`]);
        this.schemaTypeSymbols.set(typeId, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerInlineRequestTypeSymbol(
        endpointId: string,
        requestNamePascalCase: string,
        symbolName: string
    ): string {
        const id = this.getRequestTypeSymbolId(endpointId, requestNamePascalCase);
        symbolName = this.getAvailableSymbolName(symbolName);
        this.inlineRequestTypeSymbols.set(id, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    private getAvailableSymbolName(candidate: string, fallbackCandidates?: string[]): string {
        const candidates = [candidate, ...(fallbackCandidates ?? [])];
        for (const name of candidates) {
            if (!this.exists(name)) {
                return name;
            }
        }
        let name = candidate;
        while (this.exists(name)) {
            name += "_";
        }
        return name;
    }

    private getRequestTypeSymbolId(endpointId: string, requestNamePascalCase: string): string {
        return `${endpointId}_${requestNamePascalCase}`;
    }

    public exists(symbolName: string): boolean {
        return this.symbolSet.has(symbolName);
    }
}
