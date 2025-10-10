import { assertDefined, SymbolRegistry as Namespace } from "@fern-api/core-utils";
import { LiteralEnum, swift } from "@fern-api/swift-codegen";
import { ModuleNamespace } from "./module-namespace";
import { RequestsNamespace } from "./requests-namespace";

export class SourceNameRegistry {
    public static create(): SourceNameRegistry {
        return new SourceNameRegistry();
    }

    private readonly targetSymbolRegistry: swift.TargetSymbolRegistry;
    private readonly moduleNamespace: ModuleNamespace;
    private readonly requestsNamespace: RequestsNamespace;
    private readonly requestTypeSymbols: swift.Symbol[];
    private readonly subClientSymbols: swift.Symbol[];
    private readonly nestedLiteralEnumSymbolsByParentSymbolId: Map<string, Map<string, swift.Symbol>>;

    private constructor() {
        this.targetSymbolRegistry = swift.TargetSymbolRegistry.create();
        this.moduleNamespace = new ModuleNamespace();
        this.requestsNamespace = new RequestsNamespace();
        this.requestTypeSymbols = [];
        this.subClientSymbols = [];
        this.nestedLiteralEnumSymbolsByParentSymbolId = new Map();
    }

    public getAsIsSymbolOrThrow(symbolName: string): swift.Symbol {
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return swift.Symbol.create(symbolId, symbolName);
    }

    /**
     * Registers a unique symbol name for the module.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerModuleSymbol({
        configModuleName,
        apiNamePascalCase,
        asIsSymbolNames
    }: {
        configModuleName: string | undefined;
        apiNamePascalCase: string;
        asIsSymbolNames: string[];
    }): swift.Symbol {
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
        const moduleSymbol = this.targetSymbolRegistry.registerModule(moduleSymbolName);
        asIsSymbolNames.forEach((asIsSymbolName) => {
            this.targetSymbolRegistry.registerType(asIsSymbolName);
            this.moduleNamespace.addAsIsSymbol(asIsSymbolName);
        });
        return moduleSymbol;
    }

    public getModuleSymbolOrThrow(): swift.Symbol {
        return this.targetSymbolRegistry.getModuleSymbolOrThrow();
    }

    /**
     * Registers a unique symbol name for the root client class.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerRootClientSymbol({
        configClientClassName,
        apiNamePascalCase
    }: {
        configClientClassName: string | undefined;
        apiNamePascalCase: string;
    }): swift.Symbol {
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

    public getRootClientSymbolOrThrow(): swift.Symbol {
        const symbolName = this.moduleNamespace.getRootClientNameOrThrow();
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return swift.Symbol.create(symbolId, symbolName);
    }

    /**
     * Registers and generates a unique symbol name for the environment enum.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerEnvironmentSymbol({
        configEnvironmentEnumName,
        apiNamePascalCase
    }: {
        configEnvironmentEnumName: string | undefined;
        apiNamePascalCase: string;
    }): swift.Symbol {
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

    public getEnvironmentSymbolOrThrow(): swift.Symbol {
        const symbolName = this.moduleNamespace.getEnvironmentNameOrThrow();
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return swift.Symbol.create(symbolId, symbolName);
    }

    public registerRequestsContainerSymbol(): swift.Symbol {
        const symbolName = this.moduleNamespace.addRequestsContainerSymbol([
            "Requests",
            "RequestTypes",
            "InlineRequests"
        ]);
        return this.targetSymbolRegistry.registerType(symbolName);
    }

    public getRequestsContainerSymbolOrThrow(): swift.Symbol {
        const symbolName = this.moduleNamespace.getRequestsContainerNameOrThrow();
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return swift.Symbol.create(symbolId, symbolName);
    }

    /**
     * Registers and generates a unique symbol name for an inline request type.
     * Generates different fallback candidates based on whether the request name already ends with "Request".
     *
     * @param endpointId The unique identifier of the endpoint
     * @param requestNamePascalCase The request name in PascalCase
     */
    public registerRequestTypeSymbol({
        endpointId,
        requestNamePascalCase
    }: {
        endpointId: string;
        requestNamePascalCase: string;
    }): swift.Symbol {
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
        const symbol = this.targetSymbolRegistry.registerType(symbolName);
        this.requestTypeSymbols.push(symbol);
        return symbol;
    }

    public getRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): swift.Symbol {
        const symbolName = this.moduleNamespace.getRequestTypeNameOrThrow(endpointId, requestNamePascalCase);
        const parentSymbol = this.getRequestsContainerSymbolOrThrow();
        const symbolId = this.targetSymbolRegistry.getSymbolIdForNestedType(parentSymbol.id, symbolName);
        return swift.Symbol.create(symbolId, symbolName);
    }

    public getAllRequestTypeSymbols(): swift.Symbol[] {
        return [...this.requestTypeSymbols];
    }

    /**
     * Registers and generates a unique symbol name for a sub-client class.
     * Generates fallback candidates by combining filepath parts with the subpackage name
     * to create unique identifiers when simple names collide.
     *
     * @param subpackageId The unique identifier of the subpackage
     * @param fernFilepathPartNamesPascalCase Array of filepath parts in PascalCase
     * @param subpackageNamePascalCase The subpackage name in PascalCase
     */
    public registerSubClientSymbol({
        subpackageId,
        fernFilepathPartNamesPascalCase,
        subpackageNamePascalCase
    }: {
        subpackageId: string;
        fernFilepathPartNamesPascalCase: string[];
        subpackageNamePascalCase: string;
    }): swift.Symbol {
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
        const symbol = this.targetSymbolRegistry.registerType(symbolName);
        this.subClientSymbols.push(symbol);
        return symbol;
    }

    public getSubClientSymbolOrThrow(subpackageId: string): swift.Symbol {
        const symbolName = this.moduleNamespace.getSubClientNameOrThrow(subpackageId);
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return swift.Symbol.create(symbolId, symbolName);
    }

    public getAllSubClientSymbols(): swift.Symbol[] {
        return [...this.subClientSymbols];
    }

    /**
     * Registers and generates a unique symbol name for a schema type (struct, enum, union, etc.).
     * Tries candidate names in order: {Type}, {Type}Type, {Type}Model, {Type}Schema.
     *
     * @param typeId The unique identifier of the type
     * @param typeDeclarationNamePascalCase The type declaration name in PascalCase
     */
    public registerSchemaTypeSymbol(typeId: string, typeDeclarationNamePascalCase: string): swift.Symbol {
        const symbolName = this.moduleNamespace.addSchemaTypeSymbol(typeId, [
            typeDeclarationNamePascalCase,
            `${typeDeclarationNamePascalCase}Type`,
            `${typeDeclarationNamePascalCase}Model`,
            `${typeDeclarationNamePascalCase}Schema`
        ]);
        return this.targetSymbolRegistry.registerType(symbolName);
    }

    public getSchemaTypeSymbolOrThrow(typeId: string): swift.Symbol {
        const symbolName = this.moduleNamespace.getSchemaTypeNameOrThrow(typeId);
        const symbolId = this.targetSymbolRegistry.getSymbolIdForModuleType(symbolName);
        return swift.Symbol.create(symbolId, symbolName);
    }

    public registerNestedLiteralEnumSymbol({
        parentSymbol,
        literalValue
    }: {
        parentSymbol: swift.Symbol | string;
        literalValue: string;
    }) {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        let symbolName = LiteralEnum.generateName(literalValue);
        if (symbolName === "CodingKeys") {
            symbolName = `CodingKeysEnum`;
        }
        const enumsByLiteralValue =
            this.nestedLiteralEnumSymbolsByParentSymbolId.get(parentSymbolId) ?? new Map<string, swift.Symbol>();
        const existingSymbol = enumsByLiteralValue.get(literalValue);
        return existingSymbol ?? this.targetSymbolRegistry.registerNestedType({ parentSymbol, symbolName });
    }

    public getNestedLiteralEnumSymbolOrThrow(parentSymbol: swift.Symbol | string, literalValue: string): swift.Symbol {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const enumsByLiteralValue =
            this.nestedLiteralEnumSymbolsByParentSymbolId.get(parentSymbolId) ?? new Map<string, swift.Symbol>();
        const existingSymbol = enumsByLiteralValue.get(literalValue);
        assertDefined(existingSymbol, `Nested literal enum symbol not found for literal value "${literalValue}"`);
        return existingSymbol;
    }

    public getAllNestedLiteralEnumSymbolsOrThrow(parentSymbol: swift.Symbol | string): {
        symbol: swift.Symbol;
        literalValue: string;
        caseLabel: string;
    }[] {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const enumsByLiteralValue =
            this.nestedLiteralEnumSymbolsByParentSymbolId.get(parentSymbolId) ?? new Map<string, swift.Symbol>();
        return Array.from(enumsByLiteralValue.entries())
            .sort(([, symbol1], [, symbol2]) => symbol1.name.localeCompare(symbol2.name))
            .map(([literalValue, symbol]) => ({
                symbol,
                literalValue,
                caseLabel: LiteralEnum.generateEnumCaseLabel(literalValue)
            }));
    }

    public referenceFromModuleScope(symbol: swift.Symbol | string) {
        const moduleSymbol = this.getModuleSymbolOrThrow();
        return this.targetSymbolRegistry.reference({ fromSymbol: moduleSymbol, toSymbol: symbol });
    }

    public reference({ fromSymbol, toSymbol }: { fromSymbol: swift.Symbol | string; toSymbol: swift.Symbol | string }) {
        return this.targetSymbolRegistry.reference({ fromSymbol, toSymbol });
    }

    public resolveReference({ fromSymbol, reference }: { fromSymbol: swift.Symbol | string; reference: string }) {
        return this.targetSymbolRegistry.resolveReference({ fromSymbol, reference });
    }
}
