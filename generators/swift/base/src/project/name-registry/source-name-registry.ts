import { SymbolRegistry as Namespace } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { ModuleNamespace } from "./module-namespace";
import { RequestsNamespace } from "./requests-namespace";

export interface Symbol {
    readonly id: string;
    readonly name: string;
}

export class SourceNameRegistry {
    public static create(): SourceNameRegistry {
        return new SourceNameRegistry();
    }

    private readonly targetSymbolRegistry: swift.TargetSymbolRegistry;
    private readonly moduleNamespace: ModuleNamespace;
    private readonly requestsNamespace: RequestsNamespace;
    private readonly requestTypeSymbols: Symbol[];
    private readonly subClientSymbols: Symbol[];

    private constructor() {
        this.targetSymbolRegistry = swift.TargetSymbolRegistry.create();
        this.moduleNamespace = new ModuleNamespace();
        this.requestsNamespace = new RequestsNamespace();
        this.requestTypeSymbols = [];
        this.subClientSymbols = [];
    }

    public getModuleSymbolOrThrow(): Symbol {
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModule();
        const symbolName = this.targetSymbolRegistry.getModuleSymbolOrThrow();
        return {
            id: symbolId,
            name: symbolName
        };
    }

    public getRootClientSymbolOrThrow(): Symbol {
        const symbolName = this.moduleNamespace.getRootClientNameOrThrow();
        return {
            id: this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName),
            name: symbolName
        };
    }

    public getEnvironmentSymbolOrThrow(): Symbol {
        const symbolName = this.moduleNamespace.getEnvironmentNameOrThrow();
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return {
            id: symbolId,
            name: symbolName
        };
    }

    public getRequestsContainerSymbolOrThrow(): Symbol {
        const symbolName = this.moduleNamespace.getRequestsContainerNameOrThrow();
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return {
            id: symbolId,
            name: symbolName
        };
    }

    public getRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): Symbol {
        const symbolName = this.moduleNamespace.getRequestTypeNameOrThrow(endpointId, requestNamePascalCase);
        const parentSymbol = this.getRequestsContainerSymbolOrThrow();
        const symbolId = this.targetSymbolRegistry.getSymbolIdForNestedType(parentSymbol.id, symbolName);
        return {
            id: symbolId,
            name: symbolName
        };
    }

    public getAllRequestTypeSymbols(): Symbol[] {
        return [...this.requestTypeSymbols];
    }

    public getSubClientSymbolOrThrow(subpackageId: string): Symbol {
        const symbolName = this.moduleNamespace.getSubClientNameOrThrow(subpackageId);
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return {
            id: symbolId,
            name: symbolName
        };
    }

    public getAllSubClientSymbols(): Symbol[] {
        return [...this.subClientSymbols];
    }

    public getSchemaTypeSymbolOrThrow(typeId: string): Symbol {
        const symbolName = this.moduleNamespace.getSchemaTypeNameOrThrow(typeId);
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return {
            id: symbolId,
            name: symbolName
        };
    }

    public getAsIsSymbolOrThrow(symbolName: string): Symbol {
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return {
            id: symbolId,
            name: symbolName
        };
    }

    public referenceFromModuleScope(symbolId: string) {
        const moduleSymbol = this.getModuleSymbolOrThrow();
        return this.targetSymbolRegistry.reference({ fromSymbolId: moduleSymbol.id, toSymbolId: symbolId });
    }

    public reference({ fromSymbolId, toSymbolId }: { fromSymbolId: string; toSymbolId: string }) {
        return this.targetSymbolRegistry.reference({ fromSymbolId, toSymbolId });
    }

    public resolveReference({ fromSymbolId, reference }: { fromSymbolId: string; reference: string }) {
        return this.targetSymbolRegistry.resolveReference({ fromSymbolId, reference });
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
        const symbolId = this.targetSymbolRegistry.registerType(symbolName);
        this.requestTypeSymbols.push({ id: symbolId, name: symbolName });
        return symbolId;
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
        const symbolId = this.targetSymbolRegistry.registerType(symbolName);
        this.subClientSymbols.push({ id: symbolId, name: symbolName });
        return symbolId;
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
