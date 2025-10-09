import { SymbolRegistry as Namespace } from "@fern-api/core-utils";
import { TargetSymbolRegistry } from "./target-symbol-registry";

class ModuleNamespace {
    private readonly namespace: Namespace;

    public constructor() {
        this.namespace = new Namespace();
    }

    // Name IDs

    private asIsNameId(symbolName: string): string {
        return `AsIs:${symbolName}`;
    }

    private rootClientNameId(): string {
        return `RootClientClass`;
    }

    private environmentNameId(): string {
        return `EnvironmentEnum`;
    }

    private requestsContainerNameId(): string {
        return `RequestsContainer`;
    }

    private requestTypeNameId(endpointId: string, requestNamePascalCase: string): string {
        return `RequestType:${endpointId}:${requestNamePascalCase}`;
    }

    private subClientNameId(subpackageId: string): string {
        return `SubClient:${subpackageId}`;
    }

    // Getters

    public getRootClientNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.rootClientNameId());
    }

    public getEnvironmentNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.environmentNameId());
    }

    public getRequestsContainerNameOrThrow() {
        return this.namespace.getSymbolNameByIdOrThrow(this.requestsContainerNameId());
    }

    public getRequestTypeNameOrThrow(endpointId: string, requestNamePascalCase: string) {
        return this.namespace.getSymbolNameByIdOrThrow(this.requestTypeNameId(endpointId, requestNamePascalCase));
    }

    public getSubClientNameOrThrow(subpackageId: string) {
        return this.namespace.getSymbolNameByIdOrThrow(this.subClientNameId(subpackageId));
    }

    // Setters

    public addAsIsSymbol(symbolName: string) {
        const nameId = this.asIsNameId(symbolName);
        this.namespace.registerSymbol(nameId, [symbolName]);
    }

    public addRootClientSymbol(symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.rootClientNameId();
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addEnvironmentSymbol(symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.environmentNameId();
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addRequestsContainerSymbol(symbolNameCandidates: [string, ...string[]]) {
        const nameId = `RequestsContainer`;
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addRequestTypeSymbol(endpointId: string, requestNamePascalCase: string) {
        const nameId = this.requestTypeNameId(endpointId, requestNamePascalCase);
        return this.namespace.registerSymbol(nameId, [requestNamePascalCase]);
    }

    public addSubClientSymbol(subpackageId: string, symbolNameCandidates: [string, ...string[]]) {
        const nameId = this.subClientNameId(subpackageId);
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }

    public addSchemaTypeSymbol(typeId: string, symbolNameCandidates: [string, ...string[]]) {
        const nameId = `SchemaType:${typeId}`;
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }
}

class RequestsNamespace {
    private readonly namespace: Namespace;

    public constructor() {
        this.namespace = new Namespace();
    }

    public addRequestTypeSymbol(
        endpointId: string,
        requestNamePascalCase: string,
        symbolNameCandidates: [string, ...string[]]
    ) {
        const nameId = `${endpointId}_${requestNamePascalCase}`;
        return this.namespace.registerSymbol(nameId, symbolNameCandidates);
    }
}

export class SourceNameRegistry {
    public static create(): SourceNameRegistry {
        return new SourceNameRegistry();
    }

    private readonly targetSymbolRegistry: TargetSymbolRegistry;
    private readonly moduleNamespace: ModuleNamespace;
    private readonly requestsNamespace: RequestsNamespace;

    private constructor() {
        this.targetSymbolRegistry = TargetSymbolRegistry.create();
        this.moduleNamespace = new ModuleNamespace();
        this.requestsNamespace = new RequestsNamespace();
    }

    public getModuleNameOrThrow() {
        return this.targetSymbolRegistry.getModuleSymbolOrThrow();
    }

    public getRootClientNameOrThrow() {
        return this.moduleNamespace.getRootClientNameOrThrow();
    }

    public getEnvironmentNameOrThrow() {
        return this.moduleNamespace.getEnvironmentNameOrThrow();
    }

    public getRequestsContainerNameOrThrow() {
        return this.moduleNamespace.getRequestsContainerNameOrThrow();
    }

    public getRequestTypeNameOrThrow(endpointId: string, requestNamePascalCase: string) {
        return this.moduleNamespace.getRequestTypeNameOrThrow(endpointId, requestNamePascalCase);
    }

    public getSubClientNameOrThrow(subpackageId: string) {
        return this.moduleNamespace.getSubClientNameOrThrow(subpackageId);
    }

    /**
     * Registers a unique symbol name for the module.
     * Tries preferred name first, then falls back to standard candidates.
     *
     * @returns The registered module symbol ID.
     */
    public registerModuleSymbol({
        configModuleName,
        apiNamePascalCase,
        asIsSymbolNames
    }: {
        configModuleName: string | undefined;
        apiNamePascalCase: string;
        asIsSymbolNames: string[];
    }): string {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}`,
            `${apiNamePascalCase}Api`,
            `${apiNamePascalCase}Module`
        ];
        if (typeof configModuleName === "string") {
            candidates.unshift(configModuleName);
        }
        const tempNamespace = new Namespace({ reservedSymbolNames: ["Swift", "Foundation"] });
        const moduleSymbolName = tempNamespace.registerSymbol("Module", candidates);
        const moduleSymbolId = this.targetSymbolRegistry.registerModule(moduleSymbolName);
        asIsSymbolNames.forEach((asIsSymbolName) => {
            this.targetSymbolRegistry.registerType(asIsSymbolName);
            this.moduleNamespace.addAsIsSymbol(asIsSymbolName);
        });
        return moduleSymbolId;
    }

    /**
     * Registers a unique symbol name for the root client class.
     * Tries preferred name first, then falls back to standard candidates.
     *
     * @returns The registered root client symbol ID.
     */
    public registerRootClientSymbol({
        configClientClassName,
        apiNamePascalCase
    }: {
        configClientClassName: string | undefined;
        apiNamePascalCase: string;
    }): string {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}Client`,
            `${apiNamePascalCase}ApiClient`,
            `${apiNamePascalCase}Service`
        ];
        if (typeof configClientClassName === "string") {
            candidates.unshift(configClientClassName);
        }
        const symbolName = this.moduleNamespace.addRootClientSymbol(candidates);
        return this.targetSymbolRegistry.registerType(symbolName);
    }

    /**
     * Registers and generates a unique symbol name for the environment enum.
     * Tries preferred name first, then falls back to standard candidates.
     *
     * @returns The generated environment symbol ID.
     */
    public registerEnvironmentSymbol({
        configEnvironmentEnumName,
        apiNamePascalCase
    }: {
        configEnvironmentEnumName: string | undefined;
        apiNamePascalCase: string;
    }): string {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}Environment`,
            `${apiNamePascalCase}Environ`,
            `${apiNamePascalCase}Env`
        ];
        if (typeof configEnvironmentEnumName === "string") {
            candidates.unshift(configEnvironmentEnumName);
        }
        const symbolName = this.moduleNamespace.addEnvironmentSymbol(candidates);
        return this.targetSymbolRegistry.registerType(symbolName);
    }

    public registerRequestsContainerSymbol(): string {
        const symbolName = this.moduleNamespace.addRequestsContainerSymbol([
            "Requests",
            "RequestTypes",
            "InlineRequests"
        ]);
        return this.targetSymbolRegistry.registerType(symbolName);
    }

    /**
     * Registers and generates a unique symbol name for an inline request type.
     * Generates different fallback candidates based on whether the request name already ends with "Request".
     *
     * @param endpointId The unique identifier of the endpoint
     * @param requestNamePascalCase The request name in PascalCase
     * @returns The generated unique inline request type symbol ID.
     */
    public registerRequestTypeSymbol({
        endpointId,
        requestNamePascalCase
    }: {
        endpointId: string;
        requestNamePascalCase: string;
    }): string {
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
        const symbolName = this.requestsNamespace.addRequestTypeSymbol(endpointId, requestNamePascalCase, [
            requestNamePascalCase,
            ...fallbackCandidates
        ]);
        return this.targetSymbolRegistry.registerType(symbolName);
    }

    /**
     * Registers and generates a unique symbol name for a sub-client class.
     * Generates fallback candidates by combining filepath parts with the subpackage name
     * to create unique identifiers when simple names collide.
     *
     * @param subpackageId The unique identifier of the subpackage
     * @param fernFilepathPartNamesPascalCase Array of filepath parts in PascalCase
     * @param subpackageNamePascalCase The subpackage name in PascalCase
     * @returns The generated unique sub-client symbol ID.
     */
    public registerSubClientSymbol({
        subpackageId,
        fernFilepathPartNamesPascalCase,
        subpackageNamePascalCase
    }: {
        subpackageId: string;
        fernFilepathPartNamesPascalCase: string[];
        subpackageNamePascalCase: string;
    }): string {
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
        const symbolName = this.moduleNamespace.addSubClientSymbol(subpackageId, [
            `${subpackageNamePascalCase}Client`,
            ...fallbackCandidates
        ]);
        return this.targetSymbolRegistry.registerType(symbolName);
    }

    /**
     * Registers and generates a unique symbol name for a schema type (struct, enum, union, etc.).
     * Tries candidate names in order: {Type}, {Type}Type, {Type}Model, {Type}Schema.
     *
     * @param typeId The unique identifier of the type
     * @param typeDeclarationNamePascalCase The type declaration name in PascalCase
     * @returns The generated unique schema type symbol ID.
     */
    public registerSchemaTypeSymbol(typeId: string, typeDeclarationNamePascalCase: string): string {
        const symbolName = this.moduleNamespace.addSchemaTypeSymbol(typeId, [
            typeDeclarationNamePascalCase,
            `${typeDeclarationNamePascalCase}Type`,
            `${typeDeclarationNamePascalCase}Model`,
            `${typeDeclarationNamePascalCase}Schema`
        ]);
        return this.targetSymbolRegistry.registerType(symbolName);
    }
}
