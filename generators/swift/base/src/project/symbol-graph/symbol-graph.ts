import { assertDefined } from "@fern-api/core-utils";
import { ModuleSymbol, Symbol, TypeSymbol } from "./symbol";

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
        fromSymbolId,
        targetSymbolId
    }: {
        fromSymbolId: string;
        targetSymbolId: string;
    }): string {
        const from = this.getSymbolByIdOrThrow(fromSymbolId);
        const target = this.getSymbolByIdOrThrow(targetSymbolId);
        const path = target.qualifiedPath;
        for (let k = 1; k <= path.length; k++) {
            const parts = path.slice(path.length - k);
            const resolved = this.resolvePath(from, parts);
            if (resolved?.id === target.id) {
                return parts.join(".");
            }
        }
        return target.qualifiedName;
    }

    private resolvePath(from: Symbol, parts: string[]): Symbol | null {
        const [firstPart, ...restParts] = parts;
        if (firstPart === undefined) {
            return null;
        }
        const first = this.resolveFirstSegment(from, firstPart);
        if (first === null) {
            return null;
        }
        let cur: Symbol | null = first;
        for (let i = 0; i < restParts.length; i++) {
            const part = restParts[i];
            assertDefined(part);
            cur = cur.getChildByName(part) ?? null;
            if (cur === null) {
                return null;
            }
        }
        return cur;
    }

    private resolveFirstSegment(from: Symbol, name: string): Symbol | null {
        let cur: Symbol | null = from;
        while (cur !== null) {
            const child = cur.getChildByName(name);
            if (child) {
                return child;
            }
            cur = cur.parent;
        }
        const moduleSymbol = from.kind === "module" ? from : from.getNearestModuleAncestorOrThrow();
        let resolved: Symbol | null = null;
        for (const importedModule of moduleSymbol.imports) {
            const hit = importedModule.getChildByName(name);
            if (hit) {
                if (resolved != null && resolved.id !== hit.id) {
                    return null; // ambiguous across imports
                }
                resolved = hit;
            }
        }
        return resolved;
    }

    public getSymbolByIdOrThrow(symbolId: string): Symbol {
        const symbol = this.symbolsById.get(symbolId);
        assertDefined(symbol, `A symbol with the ID '${symbolId}' was not found in the registry.`);
        return symbol;
    }

    public getSymbolById(symbolId: string): Symbol | null {
        return this.symbolsById.get(symbolId) ?? null;
    }

    private validateSymbolNotExists(symbolId: string): void {
        if (this.symbolsById.has(symbolId)) {
            throw new Error(`A symbol with the ID '${symbolId}' already exists in the registry.`);
        }
    }
}
