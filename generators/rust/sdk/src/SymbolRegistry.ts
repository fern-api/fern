import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

export interface SymbolInfo {
    originalName: string;
    resolvedName: string;
    typeId: string;
    source: "schema" | "inline" | "service" | "client";
    priority: number;
}

/**
 * Registry to manage symbol names and handle collisions in Rust code generation.
 * Inspired by Swift generator's collision handling approach.
 */
export class SymbolRegistry {
    private symbols = new Map<string, SymbolInfo>();
    private resolvedNames = new Set<string>();

    /**
     * Register symbols in priority order to handle collisions gracefully.
     * Higher priority symbols get their preferred names.
     */
    public registerSymbols(types: Record<string, TypeDeclaration>, skipDuplicates: boolean): void {
        const sortedTypes = Object.entries(types).sort(([a], [b]) => a.localeCompare(b));

        // Register in priority order
        this.registerSchemaTypes(sortedTypes, skipDuplicates);
    }

    private registerSchemaTypes(sortedTypes: [string, TypeDeclaration][], skipDuplicates: boolean): void {
        for (const [typeId, typeDeclaration] of sortedTypes) {
            const originalName = typeDeclaration.name.name.snakeCase.unsafeName;
            const resolvedName = this.resolveSymbolName(originalName, skipDuplicates);

            if (resolvedName) {
                this.symbols.set(typeId, {
                    originalName,
                    resolvedName,
                    typeId,
                    source: "schema",
                    priority: 1
                });
                this.resolvedNames.add(resolvedName);
            }
        }
    }

    private resolveSymbolName(originalName: string, skipDuplicates: boolean): string | null {
        if (!this.resolvedNames.has(originalName)) {
            return originalName;
        }

        if (skipDuplicates) {
            // Skip duplicate types entirely
            return null;
        }

        // Generate alternative names
        let counter = 2;
        let candidateName = `${originalName}_${counter}`;

        while (this.resolvedNames.has(candidateName)) {
            counter++;
            candidateName = `${originalName}_${counter}`;
        }

        return candidateName;
    }

    public getSymbol(typeId: string): SymbolInfo | undefined {
        return this.symbols.get(typeId);
    }

    public getResolvedName(typeId: string): string | undefined {
        return this.symbols.get(typeId)?.resolvedName;
    }

    public getAllSymbols(): SymbolInfo[] {
        return Array.from(this.symbols.values());
    }

    public getSkippedSymbols(): string[] {
        return Array.from(this.symbols.values())
            .filter((symbol) => symbol.resolvedName !== symbol.originalName)
            .map((symbol) => symbol.originalName);
    }

    public hasSymbol(typeId: string): boolean {
        return this.symbols.has(typeId);
    }
}
