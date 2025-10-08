import { assertNonNull } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { ModuleSymbol, SymbolGraph } from "../symbol-graph";
import { FOUNDATION_SYMBOL_NAME, foundationTypeSymbolId, SWIFT_SYMBOL_NAME, swiftTypeSymbolId } from "./symbols-ids";

export class SwiftSymbolRegistry {
    public static create(): SwiftSymbolRegistry {
        const { graph, swiftSymbol, foundationSymbol } = SwiftSymbolRegistry.createGraph();
        return new SwiftSymbolRegistry(graph, swiftSymbol, foundationSymbol);
    }

    private static createGraph(): {
        graph: SymbolGraph;
        swiftSymbol: ModuleSymbol;
        foundationSymbol: ModuleSymbol;
    } {
        const graph = new SymbolGraph();

        const createSwiftNode = () => {
            const swiftSymbol = graph.createModuleSymbol({
                symbolId: SWIFT_SYMBOL_NAME,
                symbolName: SWIFT_SYMBOL_NAME
            });
            swift.Type.primitiveSymbolNames().forEach((symbolName) => {
                const symbol = graph.createTypeSymbol({
                    symbolId: swiftTypeSymbolId(symbolName),
                    symbolName
                });
                swiftSymbol.setChild(symbol);
            });
            return swiftSymbol;
        };

        const createFoundationNode = () => {
            const foundationSymbol = graph.createModuleSymbol({
                symbolId: FOUNDATION_SYMBOL_NAME,
                symbolName: FOUNDATION_SYMBOL_NAME
            });
            swift.Type.foundationSymbolNames().forEach((symbolName) => {
                const symbol = graph.createTypeSymbol({
                    symbolId: foundationTypeSymbolId(symbolName),
                    symbolName
                });
                foundationSymbol.setChild(symbol);
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

    /**
     * Registers a module symbol. Use this to register a target module only once.
     * The import relations between the target module and Swift/Foundation will be automatically added.
     *
     * @param symbolName - The symbol name. Must not be `"Swift"` or `"Foundation"`.
     */
    public registerModule(symbolName: string) {
        if (symbolName === SWIFT_SYMBOL_NAME || symbolName === FOUNDATION_SYMBOL_NAME) {
            throw new Error(`Cannot register a module with the name '${symbolName}' because it is reserved.`);
        }
        const symbolId = symbolName;
        const moduleSymbol = this.graph.createModuleSymbol({ symbolId, symbolName });
        moduleSymbol.addImport(this.swiftSymbol);
        moduleSymbol.addImport(this.foundationSymbol);
        this.registeredModule = moduleSymbol;
        return moduleSymbol;
    }

    public registerType(symbolName: string) {
        assertNonNull(this.registeredModule, "Cannot register a type before registering a module.");
        const symbolId = this.getSymbolIdForModuleType(symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName });
        this.registeredModule.setChild(typeSymbol);
        return typeSymbol;
    }

    private getSymbolIdForModuleType(symbolName: string) {
        assertNonNull(this.registeredModule, "Cannot get symbol id for a type before registering a module.");
        return `${this.registeredModule.id}.${symbolName}`;
    }

    public reference({ fromSymbolId, toSymbolId }: { fromSymbolId: string; toSymbolId: string }) {
        const ref = this.graph.resolveReference({ fromSymbolId, targetSymbolId: toSymbolId });
        return swift.SymbolReference.from(ref);
    }
}
