import { assertDefined, SymbolRegistry } from "@fern-api/core-utils";
import { LiteralEnum } from "@fern-api/swift-codegen";
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

const SYMBOL_ID_PREFIX = "symbol_id:";

type SchemaTypeNodeId = string;

class SwiftSymbolRegistry {
    private readonly symbolGraph: SymbolGraph;
    private readonly globalRegistry: SymbolRegistry;
    private readonly moduleRegistry: SymbolRegistry;
    private readonly requestsRegistry: SymbolRegistry;
    private readonly schemaTypesRegistries: Map<SchemaTypeNodeId, SymbolRegistry>;

    public constructor() {
        this.symbolGraph = new SymbolGraph();
        this.globalRegistry = new SymbolRegistry({
            reservedSymbolNames: ["Swift", "Foundation"],
            conflictResolutionStrategy: "underscore-suffix"
        });
        this.moduleRegistry = new SymbolRegistry({
            reservedSymbolNames: [],
            conflictResolutionStrategy: "underscore-suffix"
        });
        this.requestsRegistry = new SymbolRegistry({
            reservedSymbolNames: [],
            conflictResolutionStrategy: "underscore-suffix"
        });
        this.schemaTypesRegistries = new Map();
    }

    // Node IDs

    private get moduleNodeId(): string {
        return `Module`;
    }

    private get rootClientNodeId(): string {
        return `${this.moduleNodeId}:RootClient`;
    }

    private get environmentNodeId(): string {
        return `${this.moduleNodeId}:Environment`;
    }

    private get requestsContainerNodeId(): string {
        return `${this.moduleNodeId}:Requests`;
    }

    private getRequestTypeNodeId(endpointId: string, requestNamePascalCase: string): string {
        return `${this.moduleNodeId}:Requests:${endpointId}:${requestNamePascalCase}`;
    }

    private getSubClientNodeId(subpackageId: string): string {
        return `${this.moduleNodeId}:SubClients:${subpackageId}`;
    }

    private getSchemaTypeNodeId(typeId: string): string {
        return `${this.moduleNodeId}:Schema:${typeId}`;
    }

    /**
     * @returns The node ID for a literal enum type nested within a schema type.
     */
    private getNestedLiteralEnumNodeId(parentTypeId: string, literalValue: string): string {
        return `${this.getSchemaTypeNodeId(parentTypeId)}:LiteralEnum:${literalValue}`;
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
        this.globalRegistry.registerSymbol(this.moduleNodeId, candidates);
        this.symbolGraph.createNode(this.moduleNodeId);
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
        this.moduleRegistry.registerSymbol(this.rootClientNodeId, candidates);
        const rootClientNode = this.symbolGraph.createNode(this.rootClientNodeId);
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
        this.moduleRegistry.registerSymbol(this.environmentNodeId, candidates);
        const environmentNode = this.symbolGraph.createNode(this.environmentNodeId);
        const moduleNode = this.getModuleNodeOrThrow();
        moduleNode.setChild(environmentNode);
    }

    public registerRequestsContainer() {
        this.moduleRegistry.registerSymbol(this.requestsContainerNodeId, [
            "Requests",
            "RequestTypes",
            "InlineRequests"
        ]);
        const requestsContainerNode = this.symbolGraph.createNode(this.requestsContainerNodeId);
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
        const nodeId = this.getRequestTypeNodeId(endpointId, requestNamePascalCase);
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
        this.requestsRegistry.registerSymbol(nodeId, [requestNamePascalCase, ...fallbackCandidates]);
        const requestTypeNode = this.symbolGraph.createNode(nodeId);
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
        const subClientNodeId = this.getSubClientNodeId(subpackageId);
        this.moduleRegistry.registerSymbol(subClientNodeId, [
            `${subpackageNamePascalCase}Client`,
            ...fallbackCandidates
        ]);
        const subClientNode = this.symbolGraph.createNode(subClientNodeId);
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
        const nodeId = this.getSchemaTypeNodeId(typeId);
        this.moduleRegistry.registerSymbol(nodeId, [
            typeDeclarationNamePascalCase,
            `${typeDeclarationNamePascalCase}Type`,
            `${typeDeclarationNamePascalCase}Model`,
            `${typeDeclarationNamePascalCase}Schema`
        ]);
        const schemaTypeNode = this.symbolGraph.createNode(nodeId);
        const moduleNode = this.getModuleNodeOrThrow();
        moduleNode.setChild(schemaTypeNode);
        this.schemaTypesRegistries.set(
            nodeId,
            new SymbolRegistry({
                reservedSymbolNames: [],
                conflictResolutionStrategy: "underscore-suffix"
            })
        );
    }

    public registerNestedLiteralEnumType(parentTypeId: string, literalValue: string) {
        const parentNodeId = this.getSchemaTypeNodeId(parentTypeId);
        const parentNode = this.symbolGraph.getNode(parentNodeId);
        assertDefined(parentNode, "Parent schema type node not found");
        const parentRegistry = this.schemaTypesRegistries.get(parentNodeId);
        assertDefined(parentRegistry, "Parent schema type registry not found");
        const nodeId = this.getNestedLiteralEnumNodeId(parentNodeId, literalValue);
        const nameCandidate = LiteralEnum.generateName(literalValue);
        parentRegistry.registerSymbol(nodeId, [nameCandidate]);
        const literalEnumNode = this.symbolGraph.createNode(nodeId);
        parentNode.setChild(literalEnumNode);
    }

    private getModuleNodeOrThrow(): SymbolGraphNode {
        const node = this.symbolGraph.getNode(this.moduleNodeId);
        assertDefined(node, "Module node not found");
        return node;
    }

    private getRootClientNodeOrThrow(): SymbolGraphNode {
        const node = this.symbolGraph.getNode(this.rootClientNodeId);
        assertDefined(node, "Root client node not found");
        return node;
    }

    private getEnvironmentNodeOrThrow(): SymbolGraphNode {
        const node = this.symbolGraph.getNode(this.environmentNodeId);
        assertDefined(node, "Environment node not found");
        return node;
    }

    private getRequestsContainerNodeOrThrow(): SymbolGraphNode {
        const node = this.symbolGraph.getNode(this.requestsContainerNodeId);
        assertDefined(node, "Requests container node not found");
        return node;
    }

    private getSubClientNodeOrThrow(subpackageId: string): SymbolGraphNode {
        const node = this.symbolGraph.getNode(this.getSubClientNodeId(subpackageId));
        assertDefined(node, "Subclient node not found");
        return node;
    }
}
