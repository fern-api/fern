import { assertDefined, values } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { SymbolRegistry } from "./SymbolRegistry";

const SYMBOL_ID_PREFIX = "symbol_id:";

export class ProjectSymbolRegistry {
    private static readonly reservedSymbols = [
        "Swift",
        "Foundation",
        ...swift.Type.primitiveSymbolNames(),
        ...swift.Type.foundationSymbolNames(),
        ...values(swift.Protocol)
    ];

    public static create(): ProjectSymbolRegistry {
        return new ProjectSymbolRegistry(ProjectSymbolRegistry.reservedSymbols);
    }

    private readonly registry: SymbolRegistry;
    private readonly requestsRegistry: SymbolRegistry;

    private constructor(reservedSymbolNames: string[]) {
        this.registry = new SymbolRegistry({
            reservedSymbolNames: reservedSymbolNames
        });
        this.requestsRegistry = new SymbolRegistry({ reservedSymbolNames: [] });
    }

    public getRootClientSymbolOrThrow(): string {
        const symbolName = this.registry.getSymbolNameById(this.getRootClientSymbolId());
        assertDefined(symbolName, "Root client symbol not found.");
        return symbolName;
    }

    public getEnvironmentSymbolOrThrow(): string {
        const symbolName = this.registry.getSymbolNameById(this.getEnvironmentSymbolId());
        assertDefined(symbolName, "Environment symbol not found.");
        return symbolName;
    }

    public getRequestsContainerSymbolOrThrow(): string {
        const symbolName = this.registry.getSymbolNameById(this.getRequestsContainerSymbolId());
        assertDefined(symbolName, `Requests container symbol not found`);
        return symbolName;
    }

    /**
     * Retrieves the registered fully qualified inline request type symbol name for a given endpoint and request.
     */
    public getFullyQualifiedRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): string {
        const symbolName = this.getRequestTypeSymbolOrThrow(endpointId, requestNamePascalCase);
        const containerSymbolName = this.getRequestsContainerSymbolOrThrow();
        return `${containerSymbolName}.${symbolName}`;
    }

    public getRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): string {
        const symbolId = this.getRequestTypeSymbolId(endpointId, requestNamePascalCase);
        const symbolName = this.requestsRegistry.getSymbolNameById(symbolId);
        assertDefined(symbolName, `Request symbol not found for request '${requestNamePascalCase}'`);
        return symbolName;
    }

    /**
     * Retrieves the registered sub-client symbol name for a given subpackage.
     *
     * @param subpackageId The unique identifier of the subpackage
     * @returns The sub-client symbol name for the specified subpackage
     * @throws Error if no sub-client symbol has been registered for the subpackage
     */
    public getSubClientSymbolOrThrow(subpackageId: string): string {
        const symbolName = this.registry.getSymbolNameById(this.getSubClientSymbolId(subpackageId));
        assertDefined(symbolName, `Subclient symbol not found for subpackage ${subpackageId}`);
        return symbolName;
    }

    /**
     * Retrieves the registered schema type symbol name for a given type ID.
     *
     * @param typeId The unique identifier of the schema type
     * @returns The schema type symbol name for the specified type
     * @throws Error if no schema type symbol has been registered for the type ID
     */
    public getSchemaTypeSymbolOrThrow(typeId: string): string {
        const symbolName = this.registry.getSymbolNameById(this.getSchemaTypeSymbolId(typeId));
        assertDefined(symbolName, `Schema type symbol not found for type ${typeId}`);
        return symbolName;
    }

    /**
     * Registers a unique symbol name for the root client class.
     * Tries preferred name first, then falls back to standard candidates.
     *
     * @param apiNamePascalCase The API name in PascalCase
     * @param preferredName Preferred name for the symbol
     * @returns The registered unique root client symbol name
     */
    public registerRootClientSymbol(apiNamePascalCase: string): string {
        return this.registry.registerSymbol(this.getRootClientSymbolId(), [
            `${apiNamePascalCase}Client`,
            `${apiNamePascalCase}Api`,
            `${apiNamePascalCase}ApiClient`
        ]);
    }

    /**
     * Registers and generates a unique symbol name for the environment enum.
     * Tries candidate names in order: {API}Environment, {API}Environ, {API}Env.
     *
     * @param apiNamePascalCase The API name in PascalCase
     * @returns The generated unique environment symbol name
     */
    public registerEnvironmentSymbol(apiNamePascalCase: string): string {
        return this.registry.registerSymbol(this.getEnvironmentSymbolId(), [
            `${apiNamePascalCase}Environment`,
            `${apiNamePascalCase}Environ`,
            `${apiNamePascalCase}Env`
        ]);
    }

    public registerRequestsContainerSymbol(): string {
        return this.registry.registerSymbol(this.getRequestsContainerSymbolId(), [
            "Requests",
            "RequestTypes",
            "InlineRequests"
        ]);
    }

    /**
     * Registers and generates a unique symbol name for an inline request type.
     * Generates different fallback candidates based on whether the request name already ends with "Request".
     *
     * @param endpointId The unique identifier of the endpoint
     * @param requestNamePascalCase The request name in PascalCase
     * @returns The generated unique inline request type symbol name
     */
    public registerRequestTypeSymbol(endpointId: string, requestNamePascalCase: string): string {
        const symbolId = this.getRequestTypeSymbolId(endpointId, requestNamePascalCase);
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
        return this.requestsRegistry.registerSymbol(symbolId, [requestNamePascalCase, ...fallbackCandidates]);
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
        return this.registry.registerSymbol(this.getSubClientSymbolId(subpackageId), [
            `${subpackageNamePascalCase}Client`,
            ...fallbackCandidates
        ]);
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
        return this.registry.registerSymbol(this.getSchemaTypeSymbolId(typeId), [
            typeDeclarationNamePascalCase,
            `${typeDeclarationNamePascalCase}Type`,
            `${typeDeclarationNamePascalCase}Model`,
            `${typeDeclarationNamePascalCase}Schema`
        ]);
    }

    private getRootClientSymbolId(): string {
        return `${SYMBOL_ID_PREFIX}root_client_class`;
    }

    private getEnvironmentSymbolId(): string {
        return `${SYMBOL_ID_PREFIX}environment_enum`;
    }

    private getRequestsContainerSymbolId(): string {
        return `${SYMBOL_ID_PREFIX}requests_container`;
    }

    private getSubClientSymbolId(subpackageId: string): string {
        return `${SYMBOL_ID_PREFIX}subpackage_client_${subpackageId}`;
    }

    private getSchemaTypeSymbolId(typeId: string): string {
        return `${SYMBOL_ID_PREFIX}schema_type_${typeId}`;
    }

    /**
     * @returns The symbol ID to use for the requests registry.
     */
    private getRequestTypeSymbolId(endpointId: string, requestNamePascalCase: string): string {
        return `${endpointId}_${requestNamePascalCase}`;
    }
}
