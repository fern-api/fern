import { assertDefined, SymbolRegistry } from "@fern-api/core-utils";
import { LiteralEnum, swift } from "@fern-api/swift-codegen";
import { SymbolGraph, SymbolGraphNode } from "./symbol-graph";

type SubpackageId = string;

type SwiftTypeReference = {
    swiftTypeId: string;
    genericArguments?: SwiftTypeReference[];
};

type SchemaType =
    | {
          type: "struct";
          knownProperties: {
              name: string;
              wireValue: string;
              type: SwiftTypeReference;
          }[];
          additionalPropertiesProperty: {
              name: string;
              type: SwiftTypeReference;
          } | null;
          nestedTypes: SchemaType[];
      }
    | {
          type: "enum-with-raw-values";
          cases: {
              label: string;
              value: string;
          }[];
      }
    | {
          type: "enum-with-associated-values";
          cases: {
              label: string;
              values: SwiftTypeReference[];
          }[];
      };

type FunctionParameter = {
    name: string;
    type: SwiftTypeReference;
    origin: "header" | "path-param" | "query-param" | "request-body";
};

type EndpointMethod = {
    name: string;
    mainParameters: FunctionParameter[];
    requestOptionsParameter: FunctionParameter;
};

type RootClientType = {
    name: string;
    methods: EndpointMethod[];
};

type SubClientType = {
    name: string;
    methods: EndpointMethod[];
};

type EnvironmentType = {
    name: string;
};

interface SymbolTreeInterface {
    targetName: string;
    rootClient: RootClientType;
    rootEnvironment: EnvironmentType;
    subClients: {
        [subpackageId: SubpackageId]: SubClientType;
    };
    schemaTypes: {
        [typeId: string]: SchemaType;
    };
    requests: {
        containerName: string;
        types: {
            [requestName: string]: string;
        };
    };
}

const SymbolGraphNodeIds = {
    Swift: "Swift",
    "Swift:String": "String",
    "Swift:Int": "Int",
    // ...
    Foundation: "Foundation",
    "Foundation:Date": "Date",
    "Foundation:Data": "Data",
    // ...

    Module: "Acme",
    "Module:RootClient": "AcmeClient",
    "Module:Environment": "Environment",
    "Module:Schema:MyStruct": "MyStruct",
    "Module:Schema:MyEnum": "MyEnum",
    "Module:Schema:MyStruct:MyNestedStruct": "MyNestedStruct",
    // ...
    "Module:Requests": "Requests",
    "Module:Requests:endpointId1:MyRequest": "MyRequest",
    // ...
    "Module:SubClients:subpackageId1": "MySubClient"
    // ...
};

type SchemaTypeSymbolId = string;

interface TargetSymbolRegistryConfig {
    moduleSymbolNames?: string[];
}

export class TargetSymbolRegistry {
    private readonly graph: SymbolGraph;
    private readonly globalRegistry: SymbolRegistry;
    // Creating a registry for Swift and Foundation is not actually necessary since the types within them are not dynamic
    // but we are doing it for consistency.
    private readonly swiftRegistry: SymbolRegistry;
    private readonly foundationRegistry: SymbolRegistry;
    private readonly moduleRegistry: SymbolRegistry;
    private readonly requestsRegistry: SymbolRegistry;
    private readonly schemaTypesRegistries: Map<SchemaTypeSymbolId, SymbolRegistry>;

    public constructor({ moduleSymbolNames }: TargetSymbolRegistryConfig) {
        this.graph = new SymbolGraph();
        this.globalRegistry = new SymbolRegistry({
            reservedSymbolNames: ["Swift", "Foundation"]
        });
        this.swiftRegistry = new SymbolRegistry({
            reservedSymbolNames: swift.Type.primitiveSymbolNames()
        });
        this.foundationRegistry = new SymbolRegistry({
            reservedSymbolNames: swift.Type.foundationSymbolNames()
        });
        this.moduleRegistry = new SymbolRegistry({
            reservedSymbolNames: moduleSymbolNames,
            conflictResolutionStrategy: "underscore-suffix"
        });
        this.requestsRegistry = new SymbolRegistry({
            reservedSymbolNames: [],
            conflictResolutionStrategy: "underscore-suffix"
        });
        this.schemaTypesRegistries = new Map();
    }

    public get swiftSymbolId() {
        return "Swift";
    }

    public getSwiftTypeSymbolId(typeName: string) {
        return `${this.swiftSymbolId}:${typeName}`;
    }

    public get foundationSymbolId() {
        return "Foundation";
    }

    public getFoundationTypeSymbolId(typeName: string) {
        return `${this.foundationSymbolId}:${typeName}`;
    }

    public get moduleSymbolId(): string {
        return `Module`;
    }

    public get rootClientSymbolId(): string {
        return `${this.moduleSymbolId}:RootClient`;
    }

    public get environmentSymbolId(): string {
        return `${this.moduleSymbolId}:Environment`;
    }

    public get requestsContainerSymbolId(): string {
        return `${this.moduleSymbolId}:Requests`;
    }

    public getRequestTypeSymbolId(endpointId: string, requestNamePascalCase: string): string {
        return `${this.moduleSymbolId}:Requests:${endpointId}:${requestNamePascalCase}`;
    }

    private get subClientSymbolIdPrefix(): string {
        return `${this.moduleSymbolId}:SubClients:`;
    }

    public getSubClientSymbolId(subpackageId: string): string {
        return `${this.subClientSymbolIdPrefix}:${subpackageId}`;
    }

    public getSchemaTypeSymbolId(typeId: string): string {
        return `${this.moduleSymbolId}:Schema:${typeId}`;
    }

    /**
     * @returns The node ID for a literal enum type nested within a schema type.
     */
    private getNestedLiteralEnumSymbolId(parentTypeId: string, literalValue: string): string {
        return `${this.getSchemaTypeSymbolId(parentTypeId)}:LiteralEnum:${literalValue}`;
    }

    public getModuleNameOrThrow(): string {
        return this.globalRegistry.getSymbolNameByIdOrThrow(this.moduleSymbolId);
    }

    public getRootClientNameOrThrow(): string {
        return this.moduleRegistry.getSymbolNameByIdOrThrow(this.rootClientSymbolId);
    }

    public getEnvironmentEnumNameOrThrow(): string {
        return this.moduleRegistry.getSymbolNameByIdOrThrow(this.environmentSymbolId);
    }

    public getRequestsContainerNameOrThrow(): string {
        return this.moduleRegistry.getSymbolNameByIdOrThrow(this.requestsContainerSymbolId);
    }

    public getRequestTypeNameOrThrow(endpointId: string, requestNamePascalCase: string): string {
        const symbolId = this.getRequestTypeSymbolId(endpointId, requestNamePascalCase);
        const symbolName = this.requestsRegistry.getSymbolNameById(symbolId);
        assertDefined(symbolName, `Request symbol not found for request '${requestNamePascalCase}'`);
        return symbolName;
    }

    public getAllRequestTypeSymbols() {
        return this.requestsRegistry.getAllSymbols();
    }

    /**
     * Retrieves the registered sub-client symbol name for a given subpackage.
     *
     * @param subpackageId The unique identifier of the subpackage
     * @returns The sub-client symbol name for the specified subpackage
     * @throws Error if no sub-client symbol has been registered for the subpackage
     */
    public getSubClientNameOrThrow(subpackageId: string): string {
        const symbolName = this.moduleRegistry.getSymbolNameById(this.getSubClientSymbolId(subpackageId));
        assertDefined(symbolName, `Subclient symbol not found for subpackage ${subpackageId}`);
        return symbolName;
    }

    public getAllSubClientSymbols() {
        return this.moduleRegistry
            .getAllSymbols()
            .filter((symbol) => symbol.id.startsWith(this.subClientSymbolIdPrefix));
    }

    /**
     * Retrieves the registered schema type symbol name for a given type ID.
     *
     * @param typeId The unique identifier of the schema type
     * @returns The schema type symbol name for the specified type
     * @throws Error if no schema type symbol has been registered for the type ID
     */
    public getSchemaTypeNameOrThrow(typeId: string): string {
        return this.moduleRegistry.getSymbolNameByIdOrThrow(this.getSchemaTypeSymbolId(typeId));
    }

    public getNestedLiteralEnumSymbolIdOrThrow(parentSymbolId: string, literalValue: string): string {
        const parentNode = this.graph.getNode(parentSymbolId);
        assertDefined(parentNode, "Parent schema type node not found");
        const parentRegistry = this.schemaTypesRegistries.get(parentSymbolId);
        assertDefined(parentRegistry, "Parent schema type registry not found");
        return this.getNestedLiteralEnumSymbolId(parentSymbolId, literalValue);
    }

    /**
     * Registers a unique symbol for the module.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerModule({
        configModuleName,
        apiNamePascalCase
    }: {
        configModuleName: string | undefined;
        apiNamePascalCase: string;
    }) {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}`,
            `${apiNamePascalCase}Api`,
            `${apiNamePascalCase}Module`
        ];
        if (typeof configModuleName === "string") {
            candidates.unshift(configModuleName);
        }
        const symbolName = this.globalRegistry.registerSymbol(this.moduleSymbolId, candidates);
        this.graph.createNode(this.moduleSymbolId, symbolName);
    }

    /**
     * Registers a unique symbol name for the root client class.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerRootClient({
        configClientClassName,
        apiNamePascalCase
    }: {
        configClientClassName: string | undefined;
        apiNamePascalCase: string;
    }) {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}Client`,
            `${apiNamePascalCase}ApiClient`,
            `${apiNamePascalCase}Service`
        ];
        if (typeof configClientClassName === "string") {
            candidates.unshift(configClientClassName);
        }
        const symbolName = this.moduleRegistry.registerSymbol(this.rootClientSymbolId, candidates);
        const rootClientNode = this.graph.createNode(this.rootClientSymbolId, symbolName);
        const moduleNode = this.getModuleNodeOrThrow();
        moduleNode.setChild(rootClientNode);
    }

    /**
     * Registers and generates a unique symbol name for the environment enum.
     * Tries preferred name first, then falls back to standard candidates.
     */
    public registerEnvironment({
        configEnvironmentEnumName,
        apiNamePascalCase
    }: {
        configEnvironmentEnumName: string | undefined;
        apiNamePascalCase: string;
    }) {
        const candidates: [string, ...string[]] = [
            `${apiNamePascalCase}Environment`,
            `${apiNamePascalCase}Environ`,
            `${apiNamePascalCase}Env`
        ];
        if (typeof configEnvironmentEnumName === "string") {
            candidates.unshift(configEnvironmentEnumName);
        }
        const symbolName = this.moduleRegistry.registerSymbol(this.environmentSymbolId, candidates);
        const environmentNode = this.graph.createNode(this.environmentSymbolId, symbolName);
        const moduleNode = this.getModuleNodeOrThrow();
        moduleNode.setChild(environmentNode);
    }

    public registerRequestsContainer() {
        const symbolName = this.moduleRegistry.registerSymbol(this.requestsContainerSymbolId, [
            "Requests",
            "RequestTypes",
            "InlineRequests"
        ]);
        const requestsContainerNode = this.graph.createNode(this.requestsContainerSymbolId, symbolName);
        const moduleNode = this.getModuleNodeOrThrow();
        moduleNode.setChild(requestsContainerNode);
    }

    /**
     * Registers and generates a unique symbol name for an inline request type.
     * Generates different fallback candidates based on whether the request name already ends with "Request".
     *
     * @param endpointId The unique identifier of the endpoint
     * @param requestNamePascalCase The request name in PascalCase
     */
    public registerRequestType({
        endpointId,
        requestNamePascalCase
    }: {
        endpointId: string;
        requestNamePascalCase: string;
    }) {
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
        const symbolName = this.requestsRegistry.registerSymbol(symbolId, [
            requestNamePascalCase,
            ...fallbackCandidates
        ]);
        const requestTypeNode = this.graph.createNode(symbolId, symbolName);
        const requestsContainerNode = this.getRequestsContainerNodeOrThrow();
        requestsContainerNode.setChild(requestTypeNode);
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
    public registerSubClient({
        subpackageId,
        fernFilepathPartNamesPascalCase,
        subpackageNamePascalCase
    }: {
        subpackageId: string;
        fernFilepathPartNamesPascalCase: string[];
        subpackageNamePascalCase: string;
    }) {
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
        const subClientSymbolId = this.getSubClientSymbolId(subpackageId);
        const symbolName = this.moduleRegistry.registerSymbol(subClientSymbolId, [
            `${subpackageNamePascalCase}Client`,
            ...fallbackCandidates
        ]);
        const subClientNode = this.graph.createNode(subClientSymbolId, symbolName);
        const moduleNode = this.getModuleNodeOrThrow();
        moduleNode.setChild(subClientNode);
    }

    /**
     * Registers and generates a unique symbol name for a schema type (struct, enum, union, etc.).
     * Tries candidate names in order: {Type}, {Type}Type, {Type}Model, {Type}Schema.
     *
     * @param typeId The unique identifier of the type
     * @param typeDeclarationNamePascalCase The type declaration name in PascalCase
     */
    public registerSchemaType(typeId: string, typeDeclarationNamePascalCase: string) {
        const symbolId = this.getSchemaTypeSymbolId(typeId);
        const symbolName = this.moduleRegistry.registerSymbol(symbolId, [
            typeDeclarationNamePascalCase,
            `${typeDeclarationNamePascalCase}Type`,
            `${typeDeclarationNamePascalCase}Model`,
            `${typeDeclarationNamePascalCase}Schema`
        ]);
        const schemaTypeNode = this.graph.createNode(symbolId, symbolName);
        const moduleNode = this.getModuleNodeOrThrow();
        moduleNode.setChild(schemaTypeNode);
        this.schemaTypesRegistries.set(
            symbolId,
            new SymbolRegistry({
                reservedSymbolNames: [],
                conflictResolutionStrategy: "underscore-suffix"
            })
        );
    }

    public registerNestedLiteralEnumType(parentTypeId: string, literalValue: string) {
        const parentSymbolId = this.getSchemaTypeSymbolId(parentTypeId);
        const parentNode = this.graph.getNode(parentSymbolId);
        assertDefined(parentNode, "Parent schema type node not found");
        const parentRegistry = this.schemaTypesRegistries.get(parentSymbolId);
        assertDefined(parentRegistry, "Parent schema type registry not found");
        const symbolId = this.getNestedLiteralEnumSymbolId(parentSymbolId, literalValue);
        const nameCandidate = LiteralEnum.generateName(literalValue);
        const symbolName = parentRegistry.registerSymbol(symbolId, [nameCandidate]);
        const literalEnumNode = this.graph.createNode(symbolId, symbolName);
        parentNode.setChild(literalEnumNode);
    }

    private getModuleNodeOrThrow(): SymbolGraphNode {
        const node = this.graph.getNode(this.moduleSymbolId);
        assertDefined(node, "Module node not found");
        return node;
    }

    private getRootClientNodeOrThrow(): SymbolGraphNode {
        const node = this.graph.getNode(this.rootClientSymbolId);
        assertDefined(node, "Root client node not found");
        return node;
    }

    private getEnvironmentNodeOrThrow(): SymbolGraphNode {
        const node = this.graph.getNode(this.environmentSymbolId);
        assertDefined(node, "Environment node not found");
        return node;
    }

    private getRequestsContainerNodeOrThrow(): SymbolGraphNode {
        const node = this.graph.getNode(this.requestsContainerSymbolId);
        assertDefined(node, "Requests container node not found");
        return node;
    }

    private getSubClientNodeOrThrow(subpackageId: string): SymbolGraphNode {
        const node = this.graph.getNode(this.getSubClientSymbolId(subpackageId));
        assertDefined(node, "Subclient node not found");
        return node;
    }

    public createReference(parentSymbolId: string, toSymbolId: string) {
        const parentNode = this.graph.getNode(parentSymbolId);
        const toNode = this.graph.getNode(toSymbolId);
        assertDefined(parentNode, "Parent node not found");
        assertDefined(toNode, "To node not found");

        const toNodeName = toNode.name;
        const ancestorWithSameName = this.getAncestorWithSameName(parentNode, toNodeName);

        const parentChildWithSameName = parentNode.children.find((child) => child.name === toNodeName);

        return swift.symbolReference({});
    }

    private getAncestorWithSameName(node: SymbolGraphNode, name: string): SymbolGraphNode | undefined {
        if (node.name === name) {
            return node;
        }
        if (node.parent) {
            return this.getAncestorWithSameName(node.parent, name);
        }
        return undefined;
    }
}
