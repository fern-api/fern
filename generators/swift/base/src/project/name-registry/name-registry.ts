import { assertDefined, SymbolRegistry as Namespace } from "@fern-api/core-utils";
import { LiteralEnum, swift } from "@fern-api/swift-codegen";
import { uniqWith } from "lodash-es";
import { AsIsSymbolName } from "../../AsIs";
import { RequestsNamespace } from "./requests-namespace";
import { SourceModuleNamespace } from "./source-module-namespace";
import { TestModuleNamespace } from "./test-module-namespace";

type UndiscriminatedUnionVariant = {
    caseName: string;
    swiftType: swift.TypeReference;
    docsContent: string | undefined;
};

type DiscriminatedUnionVariant = {
    caseName: string;
    symbolName: string;
    swiftType: swift.TypeReference;
    docsContent: string | undefined;
};

export class NameRegistry {
    public static create(): NameRegistry {
        return new NameRegistry();
    }

    private readonly targetSymbolRegistry: swift.TargetSymbolRegistry;
    private readonly sourceModuleNamespace: SourceModuleNamespace;
    private readonly testModuleNamespace: TestModuleNamespace;
    private readonly requestsNamespace: RequestsNamespace;
    private readonly sourceAsIsSymbolsByName: Map<string, swift.Symbol>;
    private readonly testAsIsSymbolsByName: Map<string, swift.Symbol>;
    private readonly requestTypeSymbols: swift.Symbol[];
    private readonly subClientSymbols: swift.Symbol[];
    private readonly nestedLiteralEnumSymbolsByParentSymbolId: Map<string, Map<string, swift.Symbol>>;
    private readonly discriminatedUnionVariantsByParentSymbolId: Map<string, DiscriminatedUnionVariant[]>;
    private readonly undiscriminatedUnionVariantsByParentSymbolId: Map<string, UndiscriminatedUnionVariant[]>;

    private constructor() {
        this.targetSymbolRegistry = swift.TargetSymbolRegistry.create();
        this.sourceModuleNamespace = new SourceModuleNamespace();
        this.testModuleNamespace = new TestModuleNamespace();
        this.requestsNamespace = new RequestsNamespace();
        this.sourceAsIsSymbolsByName = new Map();
        this.testAsIsSymbolsByName = new Map();
        this.requestTypeSymbols = [];
        this.subClientSymbols = [];
        this.nestedLiteralEnumSymbolsByParentSymbolId = new Map();
        this.discriminatedUnionVariantsByParentSymbolId = new Map();
        this.undiscriminatedUnionVariantsByParentSymbolId = new Map();
    }

    public getAsIsSymbolOrThrow(symbolName: AsIsSymbolName): swift.Symbol {
        const symbol = this.sourceAsIsSymbolsByName.get(symbolName);
        assertDefined(symbol, `As is symbol not found for name "${symbolName}"`);
        return symbol;
    }

    /**
     * Registers a unique symbol name for the source module.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerSourceModuleSymbol({
        configModuleName,
        apiNamePascalCase,
        asIsSymbols
    }: {
        configModuleName: string | undefined;
        apiNamePascalCase: string;
        asIsSymbols: { name: string; shape: swift.TypeSymbolShape }[];
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
        const moduleSymbol = this.targetSymbolRegistry.registerSourceModule(moduleSymbolName);
        asIsSymbols.forEach((asIsSymbol) => {
            const symbolName = asIsSymbol.name;
            this.targetSymbolRegistry.registerSourceModuleType(symbolName, asIsSymbol.shape);
            this.sourceModuleNamespace.addAsIsSymbol(symbolName);
            const symbolId = this.targetSymbolRegistry.inferSymbolIdForSourceModuleType(symbolName);
            const symbol = swift.Symbol.create(symbolId, symbolName, asIsSymbol.shape);
            this.sourceAsIsSymbolsByName.set(symbolName, symbol);
        });
        return moduleSymbol;
    }

    public getRegisteredSourceModuleSymbolOrThrow(): swift.Symbol {
        return this.targetSymbolRegistry.getRegisteredSourceModuleSymbolOrThrow();
    }

    /**
     * Registers a unique symbol name for the test module.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerTestModuleSymbol({
        sourceModuleName,
        asIsSymbols
    }: {
        sourceModuleName: string;
        asIsSymbols: { name: string; shape: swift.TypeSymbolShape }[];
    }): swift.Symbol {
        const candidates: [string, ...string[]] = [
            `${sourceModuleName}Tests`,
            `${sourceModuleName}Test`,
            `${sourceModuleName}TestsModule`
        ];
        const moduleSymbolName = (() => {
            const ns = new Namespace();
            ns.registerSymbol("Swift", ["Swift"]);
            ns.registerSymbol("Foundation", ["Foundation"]);
            ns.registerSymbol(sourceModuleName, [sourceModuleName]);
            return ns.registerSymbol(`${sourceModuleName}Tests`, candidates);
        })();
        const moduleSymbol = this.targetSymbolRegistry.registerTestModule(moduleSymbolName);
        asIsSymbols.forEach((asIsSymbol) => {
            const symbolName = asIsSymbol.name;
            this.targetSymbolRegistry.registerTestModuleType(symbolName, asIsSymbol.shape);
            this.testModuleNamespace.addAsIsSymbol(symbolName);
            const symbolId = this.targetSymbolRegistry.inferSymbolIdForTestModuleType(symbolName);
            const symbol = swift.Symbol.create(symbolId, symbolName, asIsSymbol.shape);
            this.testAsIsSymbolsByName.set(symbolName, symbol);
        });
        return moduleSymbol;
    }

    public getRegisteredTestModuleSymbolOrThrow(): swift.Symbol {
        return this.targetSymbolRegistry.getRegisteredTestModuleSymbolOrThrow();
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
        const symbolName = this.sourceModuleNamespace.addRootClientSymbol(candidates);
        return this.targetSymbolRegistry.registerSourceModuleType(symbolName, { type: "class" });
    }

    public getRootClientSymbolOrThrow(): swift.Symbol {
        const symbolName = this.sourceModuleNamespace.getRootClientNameOrThrow();
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForSourceModuleType(symbolName);
        return this.targetSymbolRegistry.getSymbolByIdOrThrow(symbolId);
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
        const symbolName = this.sourceModuleNamespace.addEnvironmentSymbol(candidates);
        return this.targetSymbolRegistry.registerSourceModuleType(symbolName, { type: "enum-with-raw-values" });
    }

    public getEnvironmentSymbolOrThrow(): swift.Symbol {
        const symbolName = this.sourceModuleNamespace.getEnvironmentNameOrThrow();
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForSourceModuleType(symbolName);
        return this.targetSymbolRegistry.getSymbolByIdOrThrow(symbolId);
    }

    public registerRequestsContainerSymbol(): swift.Symbol {
        const symbolName = this.sourceModuleNamespace.addRequestsContainerSymbol([
            "Requests",
            "RequestTypes",
            "InlineRequests"
        ]);
        return this.targetSymbolRegistry.registerSourceModuleType(symbolName, { type: "enum-container" });
    }

    public getRequestsContainerSymbolOrThrow(): swift.Symbol {
        const symbolName = this.sourceModuleNamespace.getRequestsContainerNameOrThrow();
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForSourceModuleType(symbolName);
        return this.targetSymbolRegistry.getSymbolByIdOrThrow(symbolId);
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
        const parentSymbol = this.getRequestsContainerSymbolOrThrow();
        const symbolName = this.requestsNamespace.addRequestTypeSymbol(endpointId, requestNamePascalCase, [
            requestNamePascalCase,
            ...fallbackCandidates
        ]);
        const symbol = this.targetSymbolRegistry.registerNestedType({
            parentSymbol,
            symbolName,
            shape: { type: "struct" }
        });
        this.requestTypeSymbols.push(symbol);
        return symbol;
    }

    public getRequestTypeSymbolOrThrow(endpointId: string, requestNamePascalCase: string): swift.Symbol {
        const symbolName = this.requestsNamespace.getRequestTypeNameOrThrow(endpointId, requestNamePascalCase);
        const parentSymbol = this.getRequestsContainerSymbolOrThrow();
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForNestedType(parentSymbol.id, symbolName);
        return this.targetSymbolRegistry.getSymbolByIdOrThrow(symbolId);
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
        const symbolName = this.sourceModuleNamespace.addSubClientSymbol(subpackageId, [
            `${subpackageNamePascalCase}Client`,
            ...fallbackCandidates
        ]);
        const symbol = this.targetSymbolRegistry.registerSourceModuleType(symbolName, { type: "class" });
        this.subClientSymbols.push(symbol);
        return symbol;
    }

    public getSubClientSymbolOrThrow(subpackageId: string): swift.Symbol {
        const symbolName = this.sourceModuleNamespace.getSubClientNameOrThrow(subpackageId);
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForSourceModuleType(symbolName);
        return this.targetSymbolRegistry.getSymbolByIdOrThrow(symbolId);
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
    public registerSchemaTypeSymbol(
        typeId: string,
        typeDeclarationNamePascalCase: string,
        shape: swift.TypeSymbolShape
    ): swift.Symbol {
        const symbolName = this.sourceModuleNamespace.addSchemaTypeSymbol(typeId, [
            typeDeclarationNamePascalCase,
            `${typeDeclarationNamePascalCase}Type`,
            `${typeDeclarationNamePascalCase}Model`,
            `${typeDeclarationNamePascalCase}Schema`
        ]);
        return this.targetSymbolRegistry.registerSourceModuleType(symbolName, shape);
    }

    public getSchemaTypeSymbolOrThrow(typeId: string): swift.Symbol {
        const symbolName = this.sourceModuleNamespace.getSchemaTypeNameOrThrow(typeId);
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForSourceModuleType(symbolName);
        return this.targetSymbolRegistry.getSymbolByIdOrThrow(symbolId);
    }

    public registerNestedLiteralEnumSymbol({
        parentSymbol,
        literalValue
    }: {
        parentSymbol: swift.Symbol | string;
        literalValue: string;
    }) {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;

        const enumsByLiteralValue =
            this.nestedLiteralEnumSymbolsByParentSymbolId.get(parentSymbolId) ?? new Map<string, swift.Symbol>();
        const existingSymbol = enumsByLiteralValue.get(literalValue);
        if (existingSymbol) {
            return existingSymbol;
        }
        const literalEnumSymbolsForParent = Array.from(enumsByLiteralValue.values());

        const symbolName = (() => {
            const ns = new Namespace({ reservedSymbolNames: ["CodingKeys"] });
            literalEnumSymbolsForParent.forEach((s) => {
                ns.registerSymbol(s.id, [s.name]);
            });
            const mainCandidate = LiteralEnum.generateName(literalValue);
            return ns.registerSymbol(literalValue, [
                mainCandidate,
                `${mainCandidate}Literal`,
                `${mainCandidate}Enum`,
                `${mainCandidate}StringEnum`
            ]);
        })();

        const newSymbol = this.targetSymbolRegistry.registerNestedType({
            parentSymbol,
            symbolName,
            shape: { type: "enum-with-raw-values" }
        });
        enumsByLiteralValue.set(literalValue, newSymbol);
        this.nestedLiteralEnumSymbolsByParentSymbolId.set(parentSymbolId, enumsByLiteralValue);
        return newSymbol;
    }

    public getNestedLiteralEnumSymbolOrThrow(parentSymbol: swift.Symbol | string, literalValue: string): swift.Symbol {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const enumsByLiteralValue =
            this.nestedLiteralEnumSymbolsByParentSymbolId.get(parentSymbolId) ?? new Map<string, swift.Symbol>();
        const existingSymbol = enumsByLiteralValue.get(literalValue);
        assertDefined(
            existingSymbol,
            `Nested literal enum symbol not found for literal value "${literalValue}" in parent symbol "${parentSymbolId}"`
        );
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

    public registerDiscriminatedUnionVariants({
        parentSymbol,
        variants
    }: {
        parentSymbol: swift.Symbol | string;
        variants: DiscriminatedUnionVariant[];
    }) {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const sortedVariants = [...variants].sort((a, b) => a.caseName.localeCompare(b.caseName));
        this.discriminatedUnionVariantsByParentSymbolId.set(parentSymbolId, sortedVariants);
        return sortedVariants;
    }

    public getDiscriminatedUnionVariantSymbolOrThrow(
        parentSymbol: swift.Symbol | string,
        caseName: string
    ): swift.Symbol {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const variants = this.discriminatedUnionVariantsByParentSymbolId.get(parentSymbolId) ?? [];
        const variant = variants.find((v) => v.caseName === caseName);
        assertDefined(
            variant,
            `Discriminated union variant symbol not found for case name "${caseName}" in parent symbol "${parentSymbolId}"`
        );
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForNestedType(parentSymbolId, variant.symbolName);
        return swift.Symbol.create(symbolId, variant.symbolName, { type: "struct" });
    }

    public getAllDiscriminatedUnionVariantsOrThrow(parentSymbol: swift.Symbol | string): DiscriminatedUnionVariant[] {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        return this.discriminatedUnionVariantsByParentSymbolId.get(parentSymbolId) ?? [];
    }

    public registerUndiscriminatedUnionVariants({
        parentSymbol,
        variants
    }: {
        parentSymbol: swift.Symbol | string;
        variants: UndiscriminatedUnionVariant[];
    }) {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const distinctVariants = uniqWith(variants, (a, b) => a.caseName === b.caseName);
        distinctVariants.sort((a, b) => a.caseName.localeCompare(b.caseName));
        this.undiscriminatedUnionVariantsByParentSymbolId.set(parentSymbolId, distinctVariants);
        return distinctVariants;
    }

    public getAllUndiscriminatedUnionVariantsOrThrow(
        parentSymbol: swift.Symbol | string
    ): UndiscriminatedUnionVariant[] {
        const parentSymbolId = typeof parentSymbol === "string" ? parentSymbol : parentSymbol.id;
        const variants = this.undiscriminatedUnionVariantsByParentSymbolId.get(parentSymbolId) ?? [];
        return variants;
    }

    public registerWireTestSuiteSymbol(subclientName: string) {
        const symbolName = this.testModuleNamespace.registerWireTestSuiteSymbol(subclientName);
        return this.targetSymbolRegistry.registerTestModuleType(symbolName, { type: "struct" });
    }

    public getWireTestSuiteSymbolOrThrow(subclientName: string): swift.Symbol {
        const symbolName = this.testModuleNamespace.getWireTestSuiteNameOrThrow(subclientName);
        const symbolId = this.targetSymbolRegistry.inferSymbolIdForTestModuleType(symbolName);
        return this.targetSymbolRegistry.getSymbolByIdOrThrow(symbolId);
    }

    public referenceFromSourceModuleScope(symbol: swift.Symbol | string) {
        const moduleSymbol = this.getRegisteredSourceModuleSymbolOrThrow();
        return this.targetSymbolRegistry.reference({ fromSymbol: moduleSymbol, toSymbol: symbol });
    }

    public reference({ fromSymbol, toSymbol }: { fromSymbol: swift.Symbol | string; toSymbol: swift.Symbol | string }) {
        return this.targetSymbolRegistry.reference({ fromSymbol, toSymbol });
    }

    public resolveReference({ fromSymbol, reference }: { fromSymbol: swift.Symbol | string; reference: string }) {
        return this.targetSymbolRegistry.resolveReference({ fromSymbol, reference });
    }
}
