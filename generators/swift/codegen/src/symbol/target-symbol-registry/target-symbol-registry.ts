import { assertNonNull } from "@fern-api/core-utils";
import { Symbol } from "..";
import { ModuleSymbol, SymbolGraph } from "./symbol-graph";

/**
 * A symbol registry for a target module used in SDK generation.
 *
 * This registry manages symbol resolution and references within a Swift module,
 * with built-in support for Swift standard library and Foundation framework types.
 * It assumes that the Foundation module is imported throughout the target module.
 */
export class TargetSymbolRegistry {
    public static create(): TargetSymbolRegistry {
        const { graph, swiftSymbol, foundationSymbol } = TargetSymbolRegistry.createGraph();
        return new TargetSymbolRegistry(graph, swiftSymbol, foundationSymbol);
    }

    private static createGraph(): {
        graph: SymbolGraph;
        swiftSymbol: ModuleSymbol;
        foundationSymbol: ModuleSymbol;
    } {
        const graph = new SymbolGraph();

        const createSwiftNode = () => {
            const swiftSymbol = graph.createModuleSymbol({
                symbolId: Symbol.SWIFT_SYMBOL_ID,
                symbolName: Symbol.SWIFT_SYMBOL_NAME
            });
            Symbol.swiftTypeSymbols.forEach((symbol) => {
                const symbolNode = graph.createTypeSymbol({
                    symbolId: symbol.id,
                    symbolName: symbol.name
                });
                graph.nestSymbol({ parentSymbolId: swiftSymbol.id, childSymbolId: symbolNode.id });
            });
            return swiftSymbol;
        };

        const createFoundationNode = () => {
            const foundationSymbol = graph.createModuleSymbol({
                symbolId: Symbol.FOUNDATION_SYMBOL_ID,
                symbolName: Symbol.FOUNDATION_SYMBOL_NAME
            });
            Symbol.foundationTypeSymbols.forEach((symbol) => {
                const symbolNode = graph.createTypeSymbol({
                    symbolId: symbol.id,
                    symbolName: symbol.name
                });
                graph.nestSymbol({ parentSymbolId: foundationSymbol.id, childSymbolId: symbolNode.id });
            });
            return foundationSymbol;
        };

        const swiftSymbol = createSwiftNode();
        const foundationSymbol = createFoundationNode();

        return { graph, swiftSymbol, foundationSymbol };
    }

    private readonly graph: SymbolGraph;
    private readonly swiftSymbol: ModuleSymbol;
    private readonly foundationSymbol: ModuleSymbol;
    private registeredModule: ModuleSymbol | null;

    private constructor(graph: SymbolGraph, swiftSymbol: ModuleSymbol, foundationSymbol: ModuleSymbol) {
        this.graph = graph;
        this.swiftSymbol = swiftSymbol;
        this.foundationSymbol = foundationSymbol;
        this.registeredModule = null;
    }

    public getModuleSymbolOrThrow(): Symbol {
        assertNonNull(this.registeredModule, "Module symbol not found.");
        return Symbol.create(this.registeredModule.id, this.registeredModule.name);
    }

    /**
     * Registers a module symbol. Use this to register a target module only once.
     * The import relations between the target module and Swift/Foundation will be automatically added.
     *
     * @param symbolName - The symbol name. Must not be `"Swift"` or `"Foundation"`.
     */
    public registerModule(symbolName: string): Symbol {
        if (symbolName === Symbol.SWIFT_SYMBOL_NAME || symbolName === Symbol.FOUNDATION_SYMBOL_NAME) {
            throw new Error(`Cannot register a module with the name '${symbolName}' because it is reserved.`);
        }
        const symbolId = symbolName;
        const moduleSymbol = this.graph.createModuleSymbol({ symbolId, symbolName });
        moduleSymbol.addImport(this.swiftSymbol);
        moduleSymbol.addImport(this.foundationSymbol);
        this.registeredModule = moduleSymbol;
        return Symbol.create(moduleSymbol.id, moduleSymbol.name);
    }

    /**
     * Registers a top-level type symbol.
     *
     * @param symbolName - The symbol name.
     */
    public registerType(symbolName: string): Symbol {
        assertNonNull(this.registeredModule, "Cannot register a type before registering a module.");
        const symbolId = this.getSymbolIdForModuleType(symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName });
        this.graph.nestSymbol({ parentSymbolId: this.registeredModule.id, childSymbolId: typeSymbol.id });
        return Symbol.create(typeSymbol.id, typeSymbol.name);
    }

    /**
     * Registers a nested type symbol.
     */
    public registerNestedType({
        parentSymbol,
        symbolName
    }: {
        parentSymbol: Symbol | string;
        symbolName: string;
    }): Symbol {
        assertNonNull(this.registeredModule, "Cannot register a nested type before registering a module.");
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const symbolId = this.getSymbolIdForNestedType(parentSymbolId, symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName });
        this.graph.nestSymbol({ parentSymbolId, childSymbolId: typeSymbol.id });
        return Symbol.create(typeSymbol.id, typeSymbol.name);
    }

    public reference({ fromSymbol, toSymbol }: { fromSymbol: Symbol | string; toSymbol: Symbol | string }) {
        const fromSymbolId = typeof fromSymbol === "string" ? fromSymbol : fromSymbol.id;
        const toSymbolId = typeof toSymbol === "string" ? toSymbol : toSymbol.id;
        return this.graph.reference({ fromSymbolId, targetSymbolId: toSymbolId });
    }

    public resolveReference({ fromSymbol, reference }: { fromSymbol: Symbol | string; reference: string }) {
        const fromSymbolId = typeof fromSymbol === "string" ? fromSymbol : fromSymbol.id;
        const symbol = this.graph.resolveReference({ fromSymbolId, reference });
        return symbol ? Symbol.create(symbol.id, symbol.name) : null;
    }

    public getSymbolIdForModuleType(symbolName: string) {
        assertNonNull(this.registeredModule, "Cannot get symbol id for a type before registering a module.");
        return `${this.registeredModule.id}.${symbolName}`;
    }

    public getSymbolIdForNestedType(parentSymbolId: string, symbolName: string) {
        return `${parentSymbolId}.${symbolName}`;
    }
}
