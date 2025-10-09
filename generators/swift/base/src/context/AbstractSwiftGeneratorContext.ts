import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertDefined, assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema, swift } from "@fern-api/swift-codegen";
import {
    FernFilepath,
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    Package,
    PrimitiveTypeV1,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { AsIsFileDefinition, SourceAsIsFiles, TestAsIsFiles } from "../AsIs";
import { SourceNameRegistry, SourceSymbolRegistry, SwiftProject, TestSymbolRegistry } from "../project";

/**
 * Registry for local type information used by individual generators to resolve type references
 * and handle nested type collisions within their specific context.
 */
export interface LocalTypeRegistry {
    getSwiftTypeForStringLiteral(literalValue: string): swift.Type;
    hasNestedTypeWithName(symbolName: string): boolean;
}

export abstract class AbstractSwiftGeneratorContext<
    CustomConfig extends BaseSwiftCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: SwiftProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = this.initProject(ir);
    }

    private initProject(ir: IntermediateRepresentation): SwiftProject {
        const project = new SwiftProject({ context: this });
        this.registerSourceSymbols(project.srcSymbolRegistry, ir);
        this.registerSourceSymbols2(project.srcNameRegistry, ir);
        this.registerTestSymbols(project.testSymbolRegistry, project.srcSymbolRegistry);
        return project;
    }

    /**
     * Register symbols in priority order - high-priority symbols first to avoid collisions.
     * Root client and environment symbols are registered first as they're most critical,
     * followed by schema types and inline request types which are commonly referenced, and
     * finally subclient symbols last since they're unlikely to be used directly by end users.
     */
    private registerSourceSymbols(symbolRegistry: SourceSymbolRegistry, ir: IntermediateRepresentation) {
        symbolRegistry.registerModuleSymbol({
            configModuleName: this.customConfig.moduleName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName
        });
        symbolRegistry.registerRootClientSymbol({
            configClientClassName: this.customConfig.clientClassName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName
        });
        symbolRegistry.registerEnvironmentSymbol({
            configEnvironmentEnumName: this.customConfig.environmentEnumName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName
        });
        Object.entries(ir.types).forEach(([typeId, typeDeclaration]) => {
            symbolRegistry.registerSchemaTypeSymbol(typeId, typeDeclaration.name.name.pascalCase.unsafeName);
        });
        symbolRegistry.registerRequestsContainerSymbol();
        Object.entries(ir.services).forEach(([_, service]) => {
            service.endpoints.forEach((endpoint) => {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    symbolRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: endpoint.requestBody.name.pascalCase.unsafeName
                    });
                } else if (endpoint.requestBody?.type === "fileUpload") {
                    symbolRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: endpoint.requestBody.name.pascalCase.unsafeName
                    });
                }
            });
        });
        Object.entries(ir.subpackages).forEach(([subpackageId, subpackage]) => {
            symbolRegistry.registerSubClientSymbol({
                subpackageId,
                fernFilepathPartNamesPascalCase: subpackage.fernFilepath.allParts.map(
                    (name) => name.pascalCase.unsafeName
                ),
                subpackageNamePascalCase: subpackage.name.pascalCase.unsafeName
            });
        });
    }

    private registerSourceSymbols2(srcNameRegistry: SourceNameRegistry, ir: IntermediateRepresentation) {
        srcNameRegistry.registerModuleSymbol({
            configModuleName: this.customConfig.moduleName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName,
            asIsSymbolNames: Object.values(SourceAsIsFiles).flatMap((file) => file.symbolNames)
        });
        srcNameRegistry.registerRootClientSymbol({
            configClientClassName: this.customConfig.clientClassName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName
        });
        srcNameRegistry.registerEnvironmentSymbol({
            configEnvironmentEnumName: this.customConfig.environmentEnumName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName
        });
        Object.entries(ir.types).forEach(([typeId, typeDeclaration]) => {
            srcNameRegistry.registerSchemaTypeSymbol(typeId, typeDeclaration.name.name.pascalCase.unsafeName);
        });
        srcNameRegistry.registerRequestsContainerSymbol();
        Object.entries(ir.services).forEach(([_, service]) => {
            service.endpoints.forEach((endpoint) => {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    srcNameRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: endpoint.requestBody.name.pascalCase.unsafeName
                    });
                } else if (endpoint.requestBody?.type === "fileUpload") {
                    srcNameRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: endpoint.requestBody.name.pascalCase.unsafeName
                    });
                }
            });
        });
        Object.entries(ir.subpackages).forEach(([subpackageId, subpackage]) => {
            srcNameRegistry.registerSubClientSymbol({
                subpackageId,
                fernFilepathPartNamesPascalCase: subpackage.fernFilepath.allParts.map(
                    (name) => name.pascalCase.unsafeName
                ),
                subpackageNamePascalCase: subpackage.name.pascalCase.unsafeName
            });
        });
    }

    private registerTestSymbols(testSymbolRegistry: TestSymbolRegistry, sourceSymbolRegistry: SourceSymbolRegistry) {
        sourceSymbolRegistry.getAllSubClientSymbols().forEach((s) => {
            testSymbolRegistry.registerWireTestSuiteSymbol(s.name);
        });
    }

    public get packageName(): string {
        const symbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return symbol.name;
    }

    public get libraryName(): string {
        const symbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return symbol.name;
    }

    public get srcTargetName(): string {
        const symbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return symbol.name;
    }

    public get testTargetName(): string {
        return `${this.srcTargetName}Tests`;
    }

    public get requestsDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Requests");
    }

    public get resourcesDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Resources");
    }

    public get schemasDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Schemas");
    }

    public get hasTests(): boolean {
        return !!this.customConfig.enableWireTests;
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        assertDefined(typeDeclaration, `Type declaration with the id '${typeId}' not found`);
        return typeDeclaration;
    }

    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        assertDefined(service, `Service with the id '${serviceId}' not found`);
        return service;
    }

    public getSubpackagesOrThrow(packageOrSubpackage: Package | Subpackage): [string, Subpackage][] {
        return packageOrSubpackage.subpackages.map((subpackageId) => {
            return [subpackageId, this.getSubpackageOrThrow(subpackageId)];
        });
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        assertDefined(subpackage, `Subpackage with the id '${subpackageId}' not found`);
        return subpackage;
    }

    public getDirectoryForFernFilepath(fernFilepath: FernFilepath): string {
        return RelativeFilePath.of([...fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/"));
    }

    public getSourceAsIsFiles(): AsIsFileDefinition[] {
        return Object.values(SourceAsIsFiles);
    }

    public getTestAsIsFiles(): AsIsFileDefinition[] {
        return Object.values(TestAsIsFiles);
    }

    public getSwiftTypeForTypeReference(
        typeReference: TypeReference,
        localTypeRegistry?: LocalTypeRegistry
    ): swift.Type {
        switch (typeReference.type) {
            case "container":
                return typeReference.container._visit({
                    literal: (literal) =>
                        literal._visit({
                            boolean: () => swift.Type.jsonValue(), // TODO(kafkas): Implement boolean literals
                            string: (literalValue) =>
                                localTypeRegistry?.getSwiftTypeForStringLiteral(literalValue) ?? swift.Type.jsonValue(),
                            _other: () => swift.Type.jsonValue()
                        }),
                    map: (type) =>
                        swift.Type.dictionary(
                            this.getSwiftTypeForTypeReference(type.keyType, localTypeRegistry),
                            this.getSwiftTypeForTypeReference(type.valueType, localTypeRegistry)
                        ),
                    set: () => swift.Type.jsonValue(), // TODO(kafkas): Implement set type
                    nullable: (ref) => swift.Type.nullable(this.getSwiftTypeForTypeReference(ref, localTypeRegistry)),
                    optional: (ref) => swift.Type.optional(this.getSwiftTypeForTypeReference(ref, localTypeRegistry)),
                    list: (ref) => swift.Type.array(this.getSwiftTypeForTypeReference(ref, localTypeRegistry)),
                    _other: () => swift.Type.jsonValue()
                });
            case "primitive":
                return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                    string: () => swift.Type.string(),
                    boolean: () => swift.Type.bool(),
                    integer: () => swift.Type.int(),
                    uint: () => swift.Type.uint(),
                    uint64: () => swift.Type.uint64(),
                    long: () => swift.Type.int64(),
                    float: () => swift.Type.float(),
                    double: () => swift.Type.double(),
                    bigInteger: () => swift.Type.string(), // TODO(kafkas): We may need to implement our own value type for this
                    date: () => swift.Type.calendarDate(),
                    dateTime: () => swift.Type.date(),
                    base64: () => swift.Type.string(),
                    uuid: () => swift.Type.uuid(),
                    _other: () => swift.Type.jsonValue()
                });
            case "named": {
                const symbolName = this.project.srcSymbolRegistry.getSchemaTypeSymbolOrThrow(typeReference.typeId);
                const hasNestedTypeWithSameName = localTypeRegistry?.hasNestedTypeWithName?.(symbolName);
                return swift.Type.custom(
                    hasNestedTypeWithSameName ? this.getFullyQualifiedNameForSchemaType(symbolName) : symbolName
                );
            }
            case "unknown":
                return swift.Type.jsonValue();
            default:
                assertNever(typeReference);
        }
    }

    public getSwiftTypeReferenceFromModuleScope(typeReference: TypeReference): swift.TypeReference {
        const symbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return this.getSwiftTypeReferenceFromScope(typeReference, symbol.id);
    }

    public getSwiftTypeReferenceFromScope(typeReference: TypeReference, fromSymbolId: string): swift.TypeReference {
        switch (typeReference.type) {
            case "container":
                return typeReference.container._visit({
                    literal: (literal) =>
                        literal._visit({
                            boolean: () => this.asIsTypeReference({ fromSymbolId, symbolName: "JSONValue" }), // TODO(kafkas): Boolean literals are not supported yet
                            string: (literalValue) => this.asIsTypeReference({ fromSymbolId, symbolName: "JSONValue" }), // TODO(kafkas): Implement now
                            _other: () => this.asIsTypeReference({ fromSymbolId, symbolName: "JSONValue" })
                        }),
                    map: (type) =>
                        swift.TypeReference.dictionary(
                            this.getSwiftTypeReferenceFromScope(type.keyType, fromSymbolId),
                            this.getSwiftTypeReferenceFromScope(type.valueType, fromSymbolId)
                        ),
                    set: () => this.asIsTypeReference({ fromSymbolId, symbolName: "JSONValue" }), // TODO(kafkas): Set types are not supported yet
                    nullable: (ref) =>
                        swift.TypeReference.nullable(this.getSwiftTypeReferenceFromScope(ref, fromSymbolId)),
                    optional: (ref) =>
                        swift.TypeReference.optional(this.getSwiftTypeReferenceFromScope(ref, fromSymbolId)),
                    list: (ref) => swift.TypeReference.array(this.getSwiftTypeReferenceFromScope(ref, fromSymbolId)),
                    _other: () => this.asIsTypeReference({ fromSymbolId, symbolName: "JSONValue" })
                });
            case "primitive":
                return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                    string: () => this.swiftTypeReference({ fromSymbolId, symbolName: "String" }),
                    boolean: () => this.swiftTypeReference({ fromSymbolId, symbolName: "Bool" }),
                    integer: () => this.swiftTypeReference({ fromSymbolId, symbolName: "Int" }),
                    uint: () => this.swiftTypeReference({ fromSymbolId, symbolName: "UInt" }),
                    uint64: () => this.swiftTypeReference({ fromSymbolId, symbolName: "UInt64" }),
                    long: () => this.swiftTypeReference({ fromSymbolId, symbolName: "Int64" }),
                    float: () => this.swiftTypeReference({ fromSymbolId, symbolName: "Float" }),
                    double: () => this.swiftTypeReference({ fromSymbolId, symbolName: "Double" }),
                    bigInteger: () => this.swiftTypeReference({ fromSymbolId, symbolName: "String" }), // TODO(kafkas): Bigints are not supported yet
                    date: () => this.asIsTypeReference({ fromSymbolId, symbolName: "CalendarDate" }),
                    dateTime: () => this.foundationTypeReference({ fromSymbolId, symbolName: "Date" }),
                    base64: () => this.swiftTypeReference({ fromSymbolId, symbolName: "String" }),
                    uuid: () => this.foundationTypeReference({ fromSymbolId, symbolName: "UUID" }),
                    _other: () => this.asIsTypeReference({ fromSymbolId, symbolName: "JSONValue" })
                });
            case "named": {
                const toSymbol = this.project.srcNameRegistry.getSchemaTypeSymbolOrThrow(typeReference.typeId);
                const symbolRef = this.project.srcNameRegistry.reference({ fromSymbolId, toSymbolId: toSymbol.id });
                return swift.TypeReference.symbol(symbolRef);
            }
            case "unknown":
                return this.asIsTypeReference({ fromSymbolId, symbolName: "JSONValue" });
            default:
                assertNever(typeReference);
        }
    }

    // TODO(kafkas): Move this?
    public swiftTypeReference({
        fromSymbolId,
        symbolName
    }: {
        fromSymbolId: string;
        symbolName: swift.SwiftTypeSymbolName;
    }) {
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbolId,
            toSymbolId: swift.Symbol.swiftTypeSymbolId(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    // TODO(kafkas): Move this?
    public resolvesToSwiftType({
        fromSymbolId,
        typeReference,
        swiftSymbolName
    }: {
        fromSymbolId: string;
        typeReference: swift.TypeReference;
        swiftSymbolName: swift.SwiftTypeSymbolName;
    }) {
        const reference = typeReference.getReferenceIfSymbolType();
        if (reference === null) {
            return false;
        }
        const resolved = this.project.srcNameRegistry.resolveReference({
            fromSymbolId,
            reference
        });
        return resolved?.id === swift.Symbol.swiftTypeSymbolId(swiftSymbolName);
    }

    // TODO(kafkas): Move this?
    public foundationTypeReference({
        fromSymbolId,
        symbolName
    }: {
        fromSymbolId: string;
        symbolName: swift.FoundationTypeSymbolName;
    }) {
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbolId,
            toSymbolId: swift.Symbol.foundationTypeSymbolId(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    // TODO(kafkas): Move this?
    public asIsTypeReference({
        fromSymbolId,
        symbolName
    }: {
        fromSymbolId: string;
        symbolName: "JSONValue" | "CalendarDate";
    }) {
        const symbol = this.project.srcNameRegistry.getAsIsSymbolOrThrow(symbolName);
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbolId,
            toSymbolId: symbol.id
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    // TODO(kafkas): Remove this
    public getFullyQualifiedNameForSchemaType(symbolName: string): string {
        return `${this.srcTargetName}.${symbolName}`;
    }

    public getEndpointMethodDetails(endpoint: HttpEndpoint) {
        const endpointContainer = this.getEndpointContainer(endpoint);
        if (endpointContainer.type === "none") {
            throw new Error(`Internal error; missing package or subpackage for endpoint ${endpoint.id}`);
        }
        const packageOrSubpackage =
            endpointContainer.type === "root-package" ? this.ir.rootPackage : endpointContainer.subpackage;
        const leadingParts = packageOrSubpackage.fernFilepath.allParts.map((p) => p.camelCase.unsafeName);
        const leadingPath = leadingParts.join(".");
        const methodName = endpoint.name.camelCase.unsafeName;
        const fullyQualifiedMethodName = [...leadingParts, methodName].join(".");
        return {
            leadingParts,
            leadingPath,
            methodName,
            fullyQualifiedMethodName
        };
    }

    public getEndpointContainer(
        endpoint: HttpEndpoint
    ):
        | { type: "root-package"; package: Package }
        | { type: "subpackage"; subpackageId: SubpackageId; subpackage: Subpackage }
        | { type: "none" } {
        const rootPackageServiceId = this.ir.rootPackage.service;
        if (rootPackageServiceId) {
            const rootPackageService = this.getHttpServiceOrThrow(rootPackageServiceId);
            if (rootPackageService.endpoints.some((e) => e.id === endpoint.id)) {
                return { type: "root-package", package: this.ir.rootPackage };
            }
        }
        for (const [subpackageId, subpackage] of Object.entries(this.ir.subpackages)) {
            if (typeof subpackage.service === "string") {
                const service = this.getHttpServiceOrThrow(subpackage.service);
                if (service.endpoints.some((e) => e.id === endpoint.id)) {
                    return { type: "subpackage", subpackageId, subpackage };
                }
            }
        }
        return { type: "none" };
    }
}
