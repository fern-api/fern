import { AsIsFiles } from "../AsIs";

export class SymbolRegistry {
    // Foundation and Swift symbols
    private static readonly reservedSymbols = ["String"];

    public static create(): SymbolRegistry {
        const registry = new SymbolRegistry(SymbolRegistry.reservedSymbols);
        Object.values(AsIsFiles).forEach((definition) => {
            definition.nodeNames.forEach((symbolName) => {
                registry.registerAsIsSymbol(symbolName);
            });
        });
        return registry;
    }

    private rootClientSymbol: string | null;
    private environmentSymbol: string | null;
    private subClientSymbols: Map<string, string>;
    private schemaTypeSymbols: Map<string, string>;
    private requestSymbols: Map<string, string>;

    private readonly symbolSet: Set<string>;

    private constructor(symbols: string[]) {
        this.rootClientSymbol = null;
        this.environmentSymbol = null;
        this.subClientSymbols = new Map();
        this.schemaTypeSymbols = new Map();
        this.requestSymbols = new Map();
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

    public getRequestSymbolOrThrow(requestNamePascalCase: string): string {
        const symbol = this.requestSymbols.get(requestNamePascalCase);
        if (symbol == null) {
            throw new Error(`Request symbol not found for request ${requestNamePascalCase}`);
        }
        return symbol;
    }

    public registerAsIsSymbol(symbolName: string): string {
        symbolName = this.getAvailableSymbolName(symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerRootClientSymbol(symbolName: string): string {
        symbolName = this.getAvailableSymbolName(symbolName);
        this.rootClientSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerEnvironmentSymbol(symbolName: string): string {
        symbolName = this.getAvailableSymbolName(symbolName);
        this.environmentSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerSubClientSymbol(subpackageId: string, symbolName: string): string {
        symbolName = this.getAvailableSymbolName(symbolName);
        this.subClientSymbols.set(subpackageId, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerSchemaTypeSymbol(typeId: string, symbolName: string): string {
        symbolName = this.getAvailableSymbolName(symbolName);
        this.schemaTypeSymbols.set(typeId, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerRequestSymbol(requestNamePascalCase: string, symbolName: string): string {
        // TODO(kafkas): Confirm if we can use request name as ID
        symbolName = this.getAvailableSymbolName(symbolName);
        this.requestSymbols.set(requestNamePascalCase, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    private getAvailableSymbolName(candidate: string): string {
        // TODO(kafkas): Improve this to produce better names
        let name = candidate;
        while (this.exists(name)) {
            name += "_";
        }
        return name;
    }

    public exists(symbolName: string): boolean {
        return this.symbolSet.has(symbolName);
    }
}
