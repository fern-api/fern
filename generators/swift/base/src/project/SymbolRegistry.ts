import { values } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { AsIsFiles } from "../AsIs";

export class SymbolRegistry {
    private static readonly reservedSymbols = [
        "Swift",
        "Foundation",
        ...swift.Type.primitiveSymbolNames(),
        ...swift.Type.foundationSymbolNames(),
        ...values(swift.Protocol)
    ];

    public static create(): SymbolRegistry {
        const registry = new SymbolRegistry(SymbolRegistry.reservedSymbols);
        Object.values(AsIsFiles).forEach((definition) => {
            definition.symbolNames.forEach((symbolName) => {
                registry.registerAsIsSymbol(symbolName);
            });
        });
        return registry;
    }

    private rootClientSymbol: string | null;
    private environmentSymbol: string | null;
    private subClientSymbols: Map<string, string>;
    private schemaTypeSymbols: Map<string, string>;
    private inlineRequestTypeSymbols: Map<string, string>;

    private readonly symbolSet: Set<string>;

    private constructor(symbols: string[]) {
        this.rootClientSymbol = null;
        this.environmentSymbol = null;
        this.subClientSymbols = new Map();
        this.schemaTypeSymbols = new Map();
        this.inlineRequestTypeSymbols = new Map();
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

    public getInlineRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): string {
        const id = this.getInlineRequestTypeSymbolId(endpointId, requestNamePascalCase);
        const symbol = this.inlineRequestTypeSymbols.get(id);
        if (symbol == null) {
            throw new Error(`Request symbol not found for request ${requestNamePascalCase}`);
        }
        return symbol;
    }

    public registerAsIsSymbol(symbolName: string): void {
        this.symbolSet.add(symbolName);
    }

    public registerRootClientSymbol(apiNamePascalCase: string): string {
        const symbolName = this.getAvailableSymbolName([
            `${apiNamePascalCase}Client`,
            `${apiNamePascalCase}Api`,
            `${apiNamePascalCase}ApiClient`,
            `${apiNamePascalCase}HttpClient`
        ]);
        this.rootClientSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerEnvironmentSymbol(apiNamePascalCase: string): string {
        const symbolName = this.getAvailableSymbolName([
            `${apiNamePascalCase}Environment`,
            `${apiNamePascalCase}Environ`,
            `${apiNamePascalCase}Env`
        ]);
        this.environmentSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerSubClientSymbol(
        subpackageId: string,
        fernFilepathPartNamesPascalCase: string[],
        subpackageNamePascalCase: string
    ): string {
        const reversedParts = fernFilepathPartNamesPascalCase.toReversed();
        reversedParts.shift();
        const fallbackCandidates = reversedParts.map(
            (_, partIdx) =>
                reversedParts
                    .slice(0, partIdx + 1)
                    .reverse()
                    .join("") +
                subpackageNamePascalCase +
                "Client"
        );
        const symbolName = this.getAvailableSymbolName([`${subpackageNamePascalCase}Client`, ...fallbackCandidates]);
        this.subClientSymbols.set(subpackageId, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerSchemaTypeSymbol(typeId: string, typeDeclarationNamePascalCase: string): string {
        const symbolName = this.getAvailableSymbolName([
            typeDeclarationNamePascalCase,
            `${typeDeclarationNamePascalCase}Type`,
            `${typeDeclarationNamePascalCase}Model`,
            `${typeDeclarationNamePascalCase}Schema`
        ]);
        this.schemaTypeSymbols.set(typeId, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    public registerInlineRequestTypeSymbol(endpointId: string, requestNamePascalCase: string): string {
        const id = this.getInlineRequestTypeSymbolId(endpointId, requestNamePascalCase);
        const fallbackCandidates: string[] = [`${requestNamePascalCase}Type`];
        if (requestNamePascalCase.endsWith("Request")) {
            fallbackCandidates.push(`${requestNamePascalCase}Body`, `${requestNamePascalCase}BodyType`);
        } else {
            fallbackCandidates.push(
                `${requestNamePascalCase}Request`,
                `${requestNamePascalCase}RequestBody`,
                `${requestNamePascalCase}RequestBodyType`
            );
        }
        const symbolName = this.getAvailableSymbolName([requestNamePascalCase, ...fallbackCandidates]);
        this.inlineRequestTypeSymbols.set(id, symbolName);
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    private getAvailableSymbolName(candidates: [string, ...string[]]): string {
        for (const name of candidates) {
            if (!this.exists(name)) {
                return name;
            }
        }
        let name = candidates[0];
        while (this.exists(name)) {
            name += "_";
        }
        return name;
    }

    private getInlineRequestTypeSymbolId(endpointId: string, requestNamePascalCase: string): string {
        return `${endpointId}_${requestNamePascalCase}`;
    }

    public exists(symbolName: string): boolean {
        return this.symbolSet.has(symbolName);
    }
}
