import { assertDefined } from "./assertDefined";

type SymbolId = string;
type SymbolName = string;

type ConflictResolutionStrategy = "append-underscore" | "append-number";

export interface SymbolRegistryOptions {
    reservedSymbolNames?: SymbolName[];
    conflictResolutionStrategy?: ConflictResolutionStrategy;
}

export class SymbolRegistry {
    public static defaultOptions: Required<SymbolRegistryOptions> = {
        reservedSymbolNames: [],
        conflictResolutionStrategy: "append-underscore"
    };

    private readonly symbolSet: Set<SymbolName>;
    private readonly symbolMap: Map<SymbolId, SymbolName>;
    private readonly conflictResolutionStrategy: ConflictResolutionStrategy;

    public constructor(options?: SymbolRegistryOptions) {
        this.symbolSet = new Set(options?.reservedSymbolNames ?? SymbolRegistry.defaultOptions.reservedSymbolNames);
        this.symbolMap = new Map();
        this.conflictResolutionStrategy =
            options?.conflictResolutionStrategy ?? SymbolRegistry.defaultOptions.conflictResolutionStrategy;
    }

    public getSymbolNameByIdOrThrow(symbolId: SymbolId) {
        const symbolName = this.getSymbolNameById(symbolId);
        assertDefined(symbolName, `Symbol with ID '${symbolId}' not found for in registry.`);
        return symbolName;
    }

    public getSymbolNameById(symbolId: SymbolId) {
        return this.symbolMap.get(symbolId);
    }

    public registerSymbol(symbolId: SymbolId, nameCandidates: [string, ...string[]]) {
        const isAlreadyRegistered = this.isSymbolIdRegistered(symbolId);
        if (isAlreadyRegistered) {
            throw new Error(`Symbol with ID '${symbolId}' is already registered.`);
        }
        const symbolName = this.getAvailableSymbolName(nameCandidates);
        this.symbolMap.set(symbolId, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    private getAvailableSymbolName(candidates: [string, ...string[]]): string {
        for (const symbolName of candidates) {
            if (!this.isSymbolNameRegistered(symbolName)) {
                return symbolName;
            }
        }
        let [symbolName] = candidates;
        // TODO: Implement append number strategy
        while (this.isSymbolNameRegistered(symbolName)) {
            symbolName += "_";
        }
        return symbolName;
    }

    /**
     * Checks whether a symbol name is already registered or reserved.
     */
    public isSymbolNameRegistered(symbolName: SymbolName): boolean {
        return this.symbolSet.has(symbolName);
    }

    /**
     * Checks whether a symbol ID is already registered.
     */
    public isSymbolIdRegistered(symbolId: SymbolId) {
        return this.symbolMap.has(symbolId);
    }
}
