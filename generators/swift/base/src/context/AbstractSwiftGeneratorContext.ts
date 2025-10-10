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
import { Referencer } from "./Referencer";

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
        const referencer = this.createReferencer(fromSymbol);
        switch (typeReference.type) {
            case "container":
                return typeReference.container._visit({
                    literal: (literal) =>
                        literal._visit({
                            boolean: () => referencer.referenceAsIsType("JSONValue"),
                            string: (literalValue) => {
                                const symbol = this.project.srcNameRegistry.getNestedLiteralEnumSymbolOrThrow(
                                    fromSymbol,
                                    literalValue
                                );
                                return referencer.referenceType(symbol);
                            },
                            _other: () => referencer.referenceAsIsType("JSONValue")
                        }),
                    map: (type) =>
                        swift.TypeReference.dictionary(
                            this.getSwiftTypeReferenceFromScope(type.keyType, fromSymbol),
                            this.getSwiftTypeReferenceFromScope(type.valueType, fromSymbol)
                        ),
                    set: () => referencer.referenceAsIsType("JSONValue"),
                    nullable: (ref) =>
                        swift.TypeReference.nullable(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
                    optional: (ref) =>
                        swift.TypeReference.optional(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
                    list: (ref) => swift.TypeReference.array(this.getSwiftTypeReferenceFromScope(ref, fromSymbol)),
                    _other: () => referencer.referenceAsIsType("JSONValue")
                });
            case "primitive":
                return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                    string: () => referencer.referenceSwiftType("String"),
                    boolean: () => referencer.referenceSwiftType("Bool"),
                    integer: () => referencer.referenceSwiftType("Int"),
                    uint: () => referencer.referenceSwiftType("UInt"),
                    uint64: () => referencer.referenceSwiftType("UInt64"),
                    long: () => referencer.referenceSwiftType("Int64"),
                    float: () => referencer.referenceSwiftType("Float"),
                    double: () => referencer.referenceSwiftType("Double"),
                    bigInteger: () => referencer.referenceSwiftType("String"),
                    date: () => referencer.referenceAsIsType("CalendarDate"),
                    dateTime: () => referencer.referenceFoundationType("Date"),
                    base64: () => referencer.referenceSwiftType("String"),
                    uuid: () => referencer.referenceFoundationType("UUID"),
                    _other: () => referencer.referenceAsIsType("JSONValue")
                });
            case "named": {
                const toSymbol = this.project.srcNameRegistry.getSchemaTypeSymbolOrThrow(typeReference.typeId);
                const symbolRef = this.project.srcNameRegistry.reference({ fromSymbol, toSymbol });
                return swift.TypeReference.symbol(symbolRef);
            }
            case "unknown":
                return referencer.referenceAsIsType("JSONValue");
            default:
                assertNever(typeReference);
        }
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

    public createReferencer(fromSymbol: swift.Symbol | string) {
        return new Referencer(this, fromSymbol);
    }
}
