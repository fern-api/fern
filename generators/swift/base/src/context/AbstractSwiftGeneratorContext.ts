import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertDefined, assertNever, noop } from "@fern-api/core-utils";
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
import { SourceNameRegistry, SwiftProject, TestSymbolRegistry } from "../project";

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
        this.registerSourceSymbols(project.srcNameRegistry, ir);
        this.registerTestSymbols(project.testSymbolRegistry, project.srcNameRegistry);
        return project;
    }

    private registerSourceSymbols(srcNameRegistry: SourceNameRegistry, ir: IntermediateRepresentation) {
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
            const schemaTypeSymbol = srcNameRegistry.registerSchemaTypeSymbol(
                typeId,
                typeDeclaration.name.name.pascalCase.unsafeName
            );
            typeDeclaration.shape._visit({
                object: (otd) => {
                    const allProperties = [...(otd.extendedProperties ?? []), ...otd.properties];

                    allProperties.forEach((property) => {
                        property.valueType._visit({
                            container: (ct) => {
                                ct._visit({
                                    literal: (literal) => {
                                        literal._visit({
                                            string: (literalValue) => {
                                                srcNameRegistry.registerNestedLiteralEnumSymbol({
                                                    parentSymbol: schemaTypeSymbol,
                                                    literalValue
                                                });
                                            },
                                            _other: noop,
                                            boolean: noop
                                        });
                                    },
                                    map: noop,
                                    list: noop,
                                    nullable: noop,
                                    optional: noop,
                                    set: noop,
                                    _other: noop
                                });
                            },
                            named: noop,
                            primitive: noop,
                            unknown: noop,
                            _other: noop
                        });
                    });

                    // TODO(kafkas): Register struct properties?
                },
                union: () => {
                    // TODO(kafkas): Register discriminated union variant symbols
                },
                undiscriminatedUnion: () => {
                    // TODO(kafkas): Register undiscriminated union variant case labels
                },
                alias: noop,
                enum: noop,
                _other: noop
            });
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

    private registerTestSymbols(testSymbolRegistry: TestSymbolRegistry, sourceSymbolRegistry: SourceNameRegistry) {
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

    public getSwiftTypeReferenceFromModuleScope(typeReference: TypeReference): swift.TypeReference {
        const symbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return this.getSwiftTypeReferenceFromScope(typeReference, symbol.id);
    }

    public getSwiftTypeReferenceFromScope(
        typeReference: TypeReference,
        fromSymbol: swift.Symbol | string
    ): swift.TypeReference {
        switch (typeReference.type) {
            case "container":
                return typeReference.container._visit({
                    literal: (literal) =>
                        literal._visit({
                            boolean: () => this.referenceAsIsType({ fromSymbol, symbolName: "JSONValue" }), // TODO(kafkas): Boolean literals are not supported yet
                            string: (literalValue) => this.referenceAsIsType({ fromSymbol, symbolName: "JSONValue" }), // TODO(kafkas): Implement now
                            _other: () => this.referenceAsIsType({ fromSymbol, symbolName: "JSONValue" })
                        }),
                    map: (type) =>
                        swift.TypeReference.dictionary(
                            this.getSwiftTypeReferenceFromScope(type.keyType, fromSymbol),
                            this.getSwiftTypeReferenceFromScope(type.valueType, fromSymbol)
                        ),
                    set: () => this.referenceAsIsType({ fromSymbol, symbolName: "JSONValue" }), // TODO(kafkas): Set types are not supported yet
                    nullable: (ref) =>
                        swift.TypeReference.nullable(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
                    optional: (ref) =>
                        swift.TypeReference.optional(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
                    list: (ref) => swift.TypeReference.array(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
                    _other: () => this.referenceAsIsType({ fromSymbol, symbolName: "JSONValue" })
                });
            case "primitive":
                return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                    string: () => this.referenceSwiftType({ fromSymbol, symbolName: "String" }),
                    boolean: () => this.referenceSwiftType({ fromSymbol, symbolName: "Bool" }),
                    integer: () => this.referenceSwiftType({ fromSymbol, symbolName: "Int" }),
                    uint: () => this.referenceSwiftType({ fromSymbol, symbolName: "UInt" }),
                    uint64: () => this.referenceSwiftType({ fromSymbol, symbolName: "UInt64" }),
                    long: () => this.referenceSwiftType({ fromSymbol, symbolName: "Int64" }),
                    float: () => this.referenceSwiftType({ fromSymbol, symbolName: "Float" }),
                    double: () => this.referenceSwiftType({ fromSymbol, symbolName: "Double" }),
                    bigInteger: () => this.referenceSwiftType({ fromSymbol, symbolName: "String" }), // TODO(kafkas): Bigints are not supported yet
                    date: () => this.referenceAsIsType({ fromSymbol, symbolName: "CalendarDate" }),
                    dateTime: () => this.referenceFoundationType({ fromSymbol, symbolName: "Date" }),
                    base64: () => this.referenceSwiftType({ fromSymbol, symbolName: "String" }),
                    uuid: () => this.referenceFoundationType({ fromSymbol, symbolName: "UUID" }),
                    _other: () => this.referenceAsIsType({ fromSymbol, symbolName: "JSONValue" })
                });
            case "named": {
                const toSymbol = this.project.srcNameRegistry.getSchemaTypeSymbolOrThrow(typeReference.typeId);
                const symbolRef = this.project.srcNameRegistry.reference({ fromSymbol, toSymbol });
                return swift.TypeReference.symbol(symbolRef);
            }
            case "unknown":
                return this.referenceAsIsType({ fromSymbol, symbolName: "JSONValue" });
            default:
                assertNever(typeReference);
        }
    }

    // TODO(kafkas): Confirm we need this
    public referenceSwiftTypeFromModuleScope(symbolName: swift.SwiftTypeSymbolName) {
        const moduleSymbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return this.referenceSwiftType({
            fromSymbol: moduleSymbol,
            symbolName
        });
    }

    public referenceSwiftType({
        fromSymbol,
        symbolName
    }: {
        fromSymbol: swift.Symbol | string;
        symbolName: swift.SwiftTypeSymbolName;
    }) {
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbol,
            toSymbol: swift.Symbol.swiftType(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    // TODO(kafkas): Confirm we need this
    public referenceFoundationTypeFromModuleScope(symbolName: swift.FoundationTypeSymbolName) {
        const moduleSymbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return this.referenceFoundationType({
            fromSymbol: moduleSymbol,
            symbolName
        });
    }

    public referenceFoundationType({
        fromSymbol,
        symbolName
    }: {
        fromSymbol: swift.Symbol | string;
        symbolName: swift.FoundationTypeSymbolName;
    }) {
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbol,
            toSymbol: swift.Symbol.foundationType(symbolName)
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    // TODO(kafkas): Confirm we need this
    // TODO(kafkas): Import param type from codegen
    public referenceAsIsTypeFromModuleScope(symbolName: "JSONValue" | "CalendarDate") {
        const moduleSymbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return this.referenceAsIsType({
            fromSymbol: moduleSymbol,
            symbolName
        });
    }

    public referenceAsIsType({
        fromSymbol,
        symbolName
    }: {
        fromSymbol: swift.Symbol | string;
        // TODO(kafkas): Import from codegen
        symbolName: "JSONValue" | "CalendarDate";
    }) {
        const symbol = this.project.srcNameRegistry.getAsIsSymbolOrThrow(symbolName);
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbol,
            toSymbol: symbol
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public referenceTypeFromModuleScope(toSymbol: swift.Symbol | string) {
        const moduleSymbol = this.project.srcNameRegistry.getModuleSymbolOrThrow();
        return this.referenceTypeFromScope({
            fromSymbol: moduleSymbol,
            toSymbol
        });
    }

    public referenceTypeFromScope({
        fromSymbol,
        toSymbol
    }: {
        fromSymbol: swift.Symbol | string;
        toSymbol: swift.Symbol | string;
    }) {
        const symbolRef = this.project.srcNameRegistry.reference({
            fromSymbol,
            toSymbol
        });
        return swift.TypeReference.symbol(symbolRef);
    }

    public resolvesToSwiftType({
        fromSymbol,
        typeReference,
        swiftSymbolName
    }: {
        fromSymbol: swift.Symbol | string;
        typeReference: swift.TypeReference;
        swiftSymbolName: swift.SwiftTypeSymbolName;
    }) {
        const reference = typeReference.getReferenceIfSymbolType();
        if (reference === null) {
            return false;
        }
        const resolved = this.project.srcNameRegistry.resolveReference({
            fromSymbol,
            reference
        });
        return resolved?.id === swift.Symbol.swiftType(swiftSymbolName).id;
    }

    public resolvesToCustomType({
        fromSymbol,
        typeReference
    }: {
        fromSymbol: swift.Symbol | string;
        typeReference: swift.TypeReference;
    }) {
        const reference = typeReference.getReferenceIfSymbolType();
        if (reference === null) {
            return false;
        }
        const resolvedSymbol = this.project.srcNameRegistry.resolveReference({
            fromSymbol,
            reference
        });
        return resolvedSymbol && swift.Symbol.isCustomSymbol(resolvedSymbol.id);
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
