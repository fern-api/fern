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

    /**
     * Creates a new SymbolRegistry instance with reserved Swift/Foundation symbols
     * and all AsIs file symbols pre-registered to avoid collisions.
     *
     * @returns A new SymbolRegistry instance ready for use
     */
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

    /**
     * Retrieves the registered root client symbol name.
     *
     * @returns The root client symbol name
     * @throws Error if no root client symbol has been registered
     */
    public getRootClientSymbolOrThrow(): string {
        const symbol = this.rootClientSymbol;
        if (symbol == null) {
            throw new Error("Root client symbol not found.");
        }
        return symbol;
    }

    /**
     * Retrieves the registered environment symbol name.
     *
     * @returns The environment symbol name
     * @throws Error if no environment symbol has been registered
     */
    public getEnvironmentSymbolOrThrow(): string {
        const symbol = this.environmentSymbol;
        if (symbol == null) {
            throw new Error("Environment symbol not found.");
        }
        return symbol;
    }

    /**
     * Retrieves the registered sub-client symbol name for a given subpackage.
     *
     * @param subpackageId The unique identifier of the subpackage
     * @returns The sub-client symbol name for the specified subpackage
     * @throws Error if no sub-client symbol has been registered for the subpackage
     */
    public getSubClientSymbolOrThrow(subpackageId: string): string {
        const symbol = this.subClientSymbols.get(subpackageId);
        if (symbol == null) {
            throw new Error(`Subclient symbol not found for subpackage ${subpackageId}`);
        }
        return symbol;
    }

    /**
     * Retrieves the registered schema type symbol name for a given type ID.
     *
     * @param typeId The unique identifier of the schema type
     * @returns The schema type symbol name for the specified type
     * @throws Error if no schema type symbol has been registered for the type ID
     */
    public getSchemaTypeSymbolOrThrow(typeId: string): string {
        const symbol = this.schemaTypeSymbols.get(typeId);
        if (symbol == null) {
            throw new Error(`Schema type symbol not found for type ${typeId}`);
        }
        return symbol;
    }

    /**
     * Retrieves the registered inline request type symbol name for a given endpoint and request.
     *
     * @param endpointId The unique identifier of the endpoint
     * @param requestNamePascalCase The request name in PascalCase
     * @returns The inline request type symbol name
     * @throws Error if no inline request type symbol has been registered for the endpoint/request combination
     */
    public getInlineRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): string {
        const id = this.getInlineRequestTypeSymbolId(endpointId, requestNamePascalCase);
        const symbol = this.inlineRequestTypeSymbols.get(id);
        if (symbol == null) {
            throw new Error(`Request symbol not found for request ${requestNamePascalCase}`);
        }
        return symbol;
    }

    /**
     * Registers an AsIs symbol to prevent collisions. AsIs symbols are pre-built
     * Swift code files that are included in the generated SDK.
     *
     * @param symbolName The symbol name to reserve
     */
    public registerAsIsSymbol(symbolName: string): void {
        this.symbolSet.add(symbolName);
    }

    /**
     * Registers a unique symbol name for the root client class.
     * Tries preferred name first, then falls back to standard candidates.
     *
     * @param apiNamePascalCase The API name in PascalCase
     * @param preferredName Preferred name for the symbol
     * @returns The registered unique root client symbol name
     */
    public registerRootClientSymbol(apiNamePascalCase: string, preferredName: string | undefined): string {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}Client`,
            `${apiNamePascalCase}Api`,
            `${apiNamePascalCase}ApiClient`
        ];
        if (typeof preferredName === "string") {
            candidates.unshift(preferredName);
        }
        const symbolName = this.getAvailableSymbolName(candidates);
        this.rootClientSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    /**
     * Registers and generates a unique symbol name for the environment enum.
     * Tries candidate names in order: {API}Environment, {API}Environ, {API}Env.
     *
     * @param apiNamePascalCase The API name in PascalCase
     * @returns The generated unique environment symbol name
     */
    public registerEnvironmentSymbol(apiNamePascalCase: string, preferredName: string | undefined): string {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}Environment`,
            `${apiNamePascalCase}Environ`,
            `${apiNamePascalCase}Env`
        ];
        if (typeof preferredName === "string") {
            candidates.unshift(preferredName);
        }
        const symbolName = this.getAvailableSymbolName(candidates);
        this.environmentSymbol = symbolName;
        this.symbolSet.add(symbolName);
        return symbolName;
    }

    /**
     * Registers and generates a unique symbol name for a sub-client class.
     * Generates fallback candidates by combining filepath parts with the subpackage name
     * to create unique identifiers when simple names collide.
     *
     * @param subpackageId The unique identifier of the subpackage
     * @param fernFilepathPartNamesPascalCase Array of filepath parts in PascalCase
     * @param subpackageNamePascalCase The subpackage name in PascalCase
     * @returns The generated unique sub-client symbol name
     */
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

    /**
     * Registers and generates a unique symbol name for a schema type (struct, enum, union, etc.).
     * Tries candidate names in order: {Type}, {Type}Type, {Type}Model, {Type}Schema.
     *
     * @param typeId The unique identifier of the type
     * @param typeDeclarationNamePascalCase The type declaration name in PascalCase
     * @returns The generated unique schema type symbol name
     */
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

    /**
     * Registers and generates a unique symbol name for an inline request type.
     * Generates different fallback candidates based on whether the request name already ends with "Request".
     *
     * @param endpointId The unique identifier of the endpoint
     * @param requestNamePascalCase The request name in PascalCase
     * @returns The generated unique inline request type symbol name
     */
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
        let [name] = candidates;
        while (this.exists(name)) {
            name += "_";
        }
        return name;
    }

    private getInlineRequestTypeSymbolId(endpointId: string, requestNamePascalCase: string): string {
        return `${endpointId}_${requestNamePascalCase}`;
    }

    /**
     * Checks whether a symbol name is already registered or reserved.
     *
     * @param symbolName The symbol name to check
     * @returns True if the symbol name is already taken, false otherwise
     */
    public exists(symbolName: string): boolean {
        return this.symbolSet.has(symbolName);
    }
}
