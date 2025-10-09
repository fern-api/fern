import { assertNonNull } from "@fern-api/core-utils";
import { Type } from "../../ast";
import { Symbol } from "..";
import { ModuleSymbol, SymbolGraph } from "../symbol-graph";

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
                symbolId: Symbol.swiftSymbolId,
                symbolName: Symbol.swiftSymbolName
            });
            Type.primitiveSymbolNames().forEach((symbolName) => {
                const symbol = graph.createTypeSymbol({
                    symbolId: Symbol.swiftTypeSymbolId(symbolName),
                    symbolName
                });
                graph.nestSymbol({ parentSymbolId: swiftSymbol.id, childSymbolId: symbol.id });
            });
            return swiftSymbol;
        };

        const createFoundationNode = () => {
            const foundationSymbol = graph.createModuleSymbol({
                symbolId: Symbol.foundationSymbolId,
                symbolName: Symbol.foundationSymbolName
            });
            Type.foundationSymbolNames().forEach((symbolName) => {
                const symbol = graph.createTypeSymbol({
                    symbolId: Symbol.foundationTypeSymbolId(symbolName),
                    symbolName
                });
                graph.nestSymbol({ parentSymbolId: foundationSymbol.id, childSymbolId: symbol.id });
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

    public getModuleSymbolOrThrow(): string {
        assertNonNull(this.registeredModule, "Module symbol not found.");
        return this.registeredModule.name;
    }

    /**
     * Registers a module symbol. Use this to register a target module only once.
     * The import relations between the target module and Swift/Foundation will be automatically added.
     *
     * @param symbolName - The symbol name. Must not be `"Swift"` or `"Foundation"`.
     * @returns The module symbol ID.
     */
    public registerModule(symbolName: string): string {
        if (symbolName === Symbol.swiftSymbolName || symbolName === Symbol.foundationSymbolName) {
            throw new Error(`Cannot register a module with the name '${symbolName}' because it is reserved.`);
        }
        const symbolId = symbolName;
        const moduleSymbol = this.graph.createModuleSymbol({ symbolId, symbolName });
        moduleSymbol.addImport(this.swiftSymbol);
        moduleSymbol.addImport(this.foundationSymbol);
        this.registeredModule = moduleSymbol;
        return symbolId;
    }

    /**
     * Registers a top-level type symbol.
     *
     * @param symbolName - The symbol name.
     * @returns The type symbol ID.
     */
    public registerType(symbolName: string) {
        assertNonNull(this.registeredModule, "Cannot register a type before registering a module.");
        const symbolId = this.getSymbolIdForModuleType(symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName });
        this.graph.nestSymbol({ parentSymbolId: this.registeredModule.id, childSymbolId: typeSymbol.id });
        return symbolId;
    }

    /**
     * Registers a nested type symbol.
     *
     * @returns The nested type symbol ID.
     */
    public registerNestedType({ parentSymbolId, symbolName }: { parentSymbolId: string; symbolName: string }): string {
        assertNonNull(this.registeredModule, "Cannot register a nested type before registering a module.");
        const symbolId = this.getSymbolIdForNestedType(parentSymbolId, symbolName);
        const typeSymbol = this.graph.createTypeSymbol({ symbolId, symbolName });
        const parentSymbol = this.graph.getSymbolByIdOrThrow(parentSymbolId);
        this.graph.nestSymbol({ parentSymbolId: parentSymbol.id, childSymbolId: typeSymbol.id });
        return symbolId;
    }

    public reference({ fromSymbolId, toSymbolId }: { fromSymbolId: string; toSymbolId: string }) {
        return this.graph.resolveReference({ fromSymbolId, targetSymbolId: toSymbolId });
    }

    private getSymbolIdForModuleType(symbolName: string) {
        assertNonNull(this.registeredModule, "Cannot get symbol id for a type before registering a module.");
        return `${this.registeredModule.id}.${symbolName}`;
    }

    private getSymbolIdForNestedType(parentSymbolId: string, symbolName: string) {
        return `${parentSymbolId}.${symbolName}`;
    }
}
