import { assertDefined, assertNever } from "./assert";

type SymbolId = string;
type SymbolName = string;

type ConflictResolutionStrategy = "underscore-suffix" | "numbered-suffix";

export interface SymbolRegistryOptions {
    reservedSymbolNames?: SymbolName[];
    conflictResolutionStrategy?: ConflictResolutionStrategy;
}

/**
 * A registry that maps symbol IDs to unique symbol names, preventing naming conflicts.
 * When conflicts occur, names are automatically resolved using the configured strategy.
 */
export class SymbolRegistry {
    public static defaultOptions: Required<SymbolRegistryOptions> = {
        reservedSymbolNames: [],
        conflictResolutionStrategy: "underscore-suffix"
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

    /**
     * Registers a new symbol with the given ID and name candidates.
     * Returns the first available name from candidates, or a conflict-resolved version.
     * @throws Error if the symbol ID is already registered
     */
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

        const [baseSymbolName] = candidates;
        let symbolName = baseSymbolName;

        if (this.conflictResolutionStrategy === "numbered-suffix") {
            let counter = 2;
            while (this.isSymbolNameRegistered(symbolName)) {
                symbolName = `${baseSymbolName}${counter++}`;
            }
        } else if (this.conflictResolutionStrategy === "underscore-suffix") {
            while (this.isSymbolNameRegistered(symbolName)) {
                symbolName += "_";
            }
        } else {
            assertNever(this.conflictResolutionStrategy);
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

    /**
     * Returns all registered symbols with their IDs and names.
     */
    public getAllSymbols() {
        return Array.from(this.symbolMap.entries()).map(([id, name]) => ({ id, name }));
    }
}
