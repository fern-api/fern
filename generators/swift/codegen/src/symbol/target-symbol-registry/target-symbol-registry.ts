import { assertNonNull } from "@fern-api/core-utils";
import { Symbol } from "..";
import { ModuleSymbol, SymbolGraph, TypeSymbolShape } from "./symbol-graph";

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
                    symbolName: symbol.name,
                    shape: { type: "system" }
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
                    symbolName: symbol.name,
                    shape: { type: "system" }
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
    private registeredSourceModule: ModuleSymbol | null;
    private registeredTestModule: ModuleSymbol | null;

    private constructor(graph: SymbolGraph, swiftSymbol: ModuleSymbol, foundationSymbol: ModuleSymbol) {
        this.graph = graph;
        this.swiftSymbol = swiftSymbol;
        this.foundationSymbol = foundationSymbol;
        this.registeredSourceModule = null;
        this.registeredTestModule = null;
    }

    public getRegisteredSourceModuleSymbolOrThrow(): Symbol {
        assertNonNull(this.registeredSourceModule, "Module symbol not found.");
        return Symbol.create(this.registeredSourceModule.id, this.registeredSourceModule.name, { type: "other" });
    }

    public getRegisteredTestModuleSymbolOrThrow(): Symbol {
        assertNonNull(this.registeredTestModule, "Module symbol not found.");
        return Symbol.create(this.registeredTestModule.id, this.registeredTestModule.name, { type: "other" });
    }

    public getSymbolByIdOrThrow(symbolId: string): Symbol {
        const symbol = this.graph.getSymbolById(symbolId);
        assertNonNull(symbol, `Symbol with ID '${symbolId}' not found in registry.`);
        return Symbol.create(symbol.id, symbol.name, symbol.kind === "type" ? symbol.shape : { type: "other" });
    }

    /**
     * Registers a source module symbol. Use this to register a source module only once.
     * The import relations between the source module and Swift/Foundation will be automatically added.
     *
     * @param symbolName - The symbol name. Must not be `"Swift"` or `"Foundation"`.
     */
    public registerSourceModule(symbolName: string): Symbol {
        const symbolId = symbolName;
        const moduleSymbol = this.graph.createModuleSymbol({ symbolId, symbolName });
        moduleSymbol.addImport(this.swiftSymbol);
        moduleSymbol.addImport(this.foundationSymbol);
        this.registeredSourceModule = moduleSymbol;
        return Symbol.create(moduleSymbol.id, moduleSymbol.name, { type: "other" });
    }

    /**
     * Registers a test module symbol. Use this to register a test module only once.
     * The import relations between the test module, source module and Swift/Foundation will be automatically added.
     *
     * @param symbolName - The symbol name. Must not be different from `"Swift"`, `"Foundation"` or the name of the source module.
     */
    public registerTestModule(symbolName: string): Symbol {
        const symbolId = symbolName;
        const moduleSymbol = this.graph.createModuleSymbol({ symbolId, symbolName });
        moduleSymbol.addImport(this.swiftSymbol);
        moduleSymbol.addImport(this.foundationSymbol);
        assertNonNull(this.registeredSourceModule, "Cannot register a test module before registering a source module.");
        moduleSymbol.addImport(this.registeredSourceModule);
        this.registeredTestModule = moduleSymbol;
        return Symbol.create(moduleSymbol.id, moduleSymbol.name, { type: "other" });
    }

    /**
     * Registers a top-level source module type symbol.
     *
     * @param symbolName - The symbol name.
     * @param shape - The information about the shape of the type.
     */
    public registerSourceModuleType(symbolName: string, shape: TypeSymbolShape): Symbol {
        assertNonNull(this.registeredSourceModule, "Cannot register a type before registering a module.");
        const symbolId = this.inferSymbolIdForSourceModuleType(symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName, shape });
        this.graph.nestSymbol({ parentSymbolId: this.registeredSourceModule.id, childSymbolId: typeSymbol.id });
        return Symbol.create(typeSymbol.id, typeSymbol.name, shape);
    }

    /**
     * Registers a top-level test module type symbol.
     *
     * @param symbolName - The symbol name.
     * @param shape - The information about the shape of the type.
     */
    public registerTestModuleType(symbolName: string, shape: TypeSymbolShape): Symbol {
        assertNonNull(this.registeredTestModule, "Cannot register a type before registering a module.");
        const symbolId = this.inferSymbolIdForTestModuleType(symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName, shape });
        this.graph.nestSymbol({ parentSymbolId: this.registeredTestModule.id, childSymbolId: typeSymbol.id });
        return Symbol.create(typeSymbol.id, typeSymbol.name, shape);
    }

    /**
     * Registers a nested type symbol.
     */
    public registerNestedType({
        parentSymbol,
        symbolName,
        shape
    }: {
        parentSymbol: Symbol | string;
        symbolName: string;
        shape: TypeSymbolShape;
    }): Symbol {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const symbolId = this.inferSymbolIdForNestedType(parentSymbolId, symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName, shape });
        this.graph.nestSymbol({ parentSymbolId, childSymbolId: typeSymbol.id });
        return Symbol.create(typeSymbol.id, typeSymbol.name, shape);
    }

    public reference({ fromSymbol, toSymbol }: { fromSymbol: Symbol | string; toSymbol: Symbol | string }) {
        const fromSymbolId = typeof fromSymbol === "string" ? fromSymbol : fromSymbol.id;
        const toSymbolId = typeof toSymbol === "string" ? toSymbol : toSymbol.id;
        return this.graph.reference({ fromSymbolId, targetSymbolId: toSymbolId });
    }

    public resolveReference({ fromSymbol, reference }: { fromSymbol: Symbol | string; reference: string }) {
        const fromSymbolId = typeof fromSymbol === "string" ? fromSymbol : fromSymbol.id;
        const symbol = this.graph.resolveReference({ fromSymbolId, reference });
        return symbol
            ? Symbol.create(symbol.id, symbol.name, symbol.kind === "type" ? symbol.shape : { type: "other" })
            : null;
    }

    public inferSymbolIdForSourceModuleType(symbolName: string) {
        assertNonNull(this.registeredSourceModule, "Cannot get symbol id for a type before registering a module.");
        return `${this.registeredSourceModule.id}.${symbolName}`;
    }

    public inferSymbolIdForTestModuleType(symbolName: string) {
        assertNonNull(this.registeredTestModule, "Cannot get symbol id for a type before registering a module.");
        return `${this.registeredTestModule.id}.${symbolName}`;
    }

    public inferSymbolIdForNestedType(parentSymbolId: string, symbolName: string) {
        return `${parentSymbolId}.${symbolName}`;
    }
}
