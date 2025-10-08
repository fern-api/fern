import { assertDefined } from "@fern-api/core-utils";
import { ModuleSymbol, Symbol, TypeSymbol } from "./Symbol";

export class SymbolGraph {
    private readonly symbolsById = new Map<string, Symbol>();

    public createModuleSymbol({ symbolId, symbolName }: { symbolId: string; symbolName: string }): ModuleSymbol {
        this.validateSymbolNotExists(symbolId);
        const symbol = new ModuleSymbol(symbolId, symbolName);
        this.symbolsById.set(symbolId, symbol);
        return symbol;
    }

    public createTypeSymbol({ symbolId, symbolName }: { symbolId: string; symbolName: string }): TypeSymbol {
        this.validateSymbolNotExists(symbolId);
        const symbol = new TypeSymbol(symbolName, symbolId);
        this.symbolsById.set(symbolId, symbol);
        return symbol;
    }

    public addImportRelation({
        clientSymbolId,
        importedSymbolId
    }: {
        clientSymbolId: string;
        importedSymbolId: string;
    }): void {
        const clientModuleSymbol = this.getSymbolByIdOrThrow(clientSymbolId);
        const importedModuleSymbol = this.getSymbolByIdOrThrow(importedSymbolId);
        if (clientModuleSymbol.kind !== "module" || importedModuleSymbol.kind !== "module") {
            throw new Error(
                `Client module '${clientModuleSymbol.id}' and imported module '${importedModuleSymbol.id}' must both be module symbols.`
            );
        }
        clientModuleSymbol.addImport(importedModuleSymbol);
    }

    public nestSymbol({ parentSymbolId, childSymbolId }: { parentSymbolId: string; childSymbolId: string }): void {
        const parentSymbol = this.getSymbolByIdOrThrow(parentSymbolId);
        const childSymbol = this.getSymbolByIdOrThrow(childSymbolId);
        parentSymbol.setChild(childSymbol);
    }

    public resolveReference({
        targetSymbolId,
        fromSymbolId
    }: {
        targetSymbolId: string;
        fromSymbolId: string;
    }): string {
        const target = this.getSymbolByIdOrThrow(targetSymbolId);
        const from = this.getSymbolByIdOrThrow(fromSymbolId);
        const targetName = target.name;

        // 1) Lexical search upward: nearest match wins
        let cur: Symbol | null = from;
        while (cur !== null) {
            const local = cur.getChildByName(targetName);
            if (local) {
                return local.id === target.id ? targetName : target.qualifiedName;
            }
            cur = cur.parent;
        }

        // 2) Search imports at nearest module
        const moduleSymbol = from.kind === "module" ? from : from.getNearestModuleAncestorOrThrow();
        const hits: Symbol[] = [];
        for (const mod of moduleSymbol.imports) {
            const hit = mod.getChildByName(targetName);
            if (hit) {
                hits.push(hit);
            }
        }

        const [firstHit, ...otherHits] = hits;

        if (firstHit?.id === target.id && otherHits.length === 0) {
            return targetName;
        }

        return target.qualifiedName;
    }

    private getSymbolByIdOrThrow(symbolId: string): Symbol {
        const symbol = this.symbolsById.get(symbolId);
        assertDefined(symbol, `A symbol with the ID '${symbolId}' was not found in the registry.`);
        return symbol;
    }

    private validateSymbolNotExists(symbolId: string): void {
        if (this.symbolsById.has(symbolId)) {
            throw new Error(`A symbol with the ID '${symbolId}' already exists in the registry.`);
        }
    }
}
