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
import { SwiftProject } from "../project";
import { Referencer } from "./Referencer";
import { registerLiteralEnums } from "./register-literal-enums";
import { inferCaseNameForTypeReference, registerUndiscriminatedUnionVariants } from "./register-undiscriminated-unions";

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
        this.project = new SwiftProject({ context: this });
        this.registerProjectSymbols(this.project, ir);
    }

    private registerProjectSymbols(project: SwiftProject, ir: IntermediateRepresentation) {
        this.registerSourceSymbols(project, ir);
        this.registerTestSymbols(project);
    }

    private registerSourceSymbols(project: SwiftProject, ir: IntermediateRepresentation) {
        const { nameRegistry } = project;
        nameRegistry.registerSourceModuleSymbol({
            configModuleName: this.customConfig.moduleName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName,
            asIsSymbols: Object.values(SourceAsIsFiles).flatMap((file) => file.symbols)
        });
        nameRegistry.registerRootClientSymbol({
            configClientClassName: this.customConfig.clientClassName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName
        });
        nameRegistry.registerEnvironmentSymbol({
            configEnvironmentEnumName: this.customConfig.environmentEnumName,
            apiNamePascalCase: ir.apiName.pascalCase.unsafeName
        });
        Object.entries(ir.types).forEach(([typeId, typeDeclaration]) => {
            const symbolShape: swift.TypeSymbolShape = typeDeclaration.shape._visit<swift.TypeSymbolShape>({
                alias: () => ({ type: "struct" }),
                enum: () => ({ type: "enum-with-raw-values" }),
                object: () => ({ type: "struct" }),
                union: () => ({ type: "enum-with-associated-values" }),
                undiscriminatedUnion: () => ({ type: "enum-with-associated-values" }),
                _other: () => ({ type: "other" })
            });
            const schemaTypeSymbol = nameRegistry.registerSchemaTypeSymbol(
                typeId,
                typeDeclaration.name.name.pascalCase.unsafeName,
                symbolShape
            );
            registerLiteralEnums({
                parentSymbol: schemaTypeSymbol,
                registry: nameRegistry,
                typeDeclaration
            });
            registerUndiscriminatedUnionVariants({
                parentSymbol: schemaTypeSymbol,
                registry: nameRegistry,
                typeDeclaration,
                context: this
            });
            // TODO(kafkas): Register discriminated union variant symbols
        });
        nameRegistry.registerRequestsContainerSymbol();
        Object.entries(ir.services).forEach(([_, service]) => {
            service.endpoints.forEach((endpoint) => {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    nameRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: endpoint.requestBody.name.pascalCase.unsafeName
                    });
                } else if (endpoint.requestBody?.type === "fileUpload") {
                    nameRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: endpoint.requestBody.name.pascalCase.unsafeName
                    });
                } else if (endpoint.requestBody?.type === "reference") {
                    nameRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: "ReferenceRequest"
                    });
                } else if (endpoint.requestBody?.type === "bytes") {
                    nameRegistry.registerRequestTypeSymbol({
                        endpointId: endpoint.id,
                        requestNamePascalCase: "BytesRequest"
                    });
                }
            });
        });
        Object.entries(ir.subpackages).forEach(([subpackageId, subpackage]) => {
            nameRegistry.registerSubClientSymbol({
                subpackageId,
                fernFilepathPartNamesPascalCase: subpackage.fernFilepath.allParts.map(
                    (name) => name.pascalCase.unsafeName
                ),
                subpackageNamePascalCase: subpackage.name.pascalCase.unsafeName
            });
        });
    }

    private registerTestSymbols(project: SwiftProject) {
        const { nameRegistry } = project;
        const sourceModuleSymbol = nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        nameRegistry.registerTestModuleSymbol({
            sourceModuleName: sourceModuleSymbol.name,
            asIsSymbols: Object.values(TestAsIsFiles).flatMap((file) => file.symbols)
        });
        nameRegistry.getAllSubClientSymbols().forEach((s) => {
            nameRegistry.registerWireTestSuiteSymbol(s.name);
        });
    }

    public get packageName(): string {
        const symbol = this.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        return symbol.name;
    }

    public get libraryName(): string {
        const symbol = this.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        return symbol.name;
    }

    public get sourceTargetName(): string {
        const symbol = this.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        return symbol.name;
    }

    public get testTargetName(): string {
        const symbol = this.project.nameRegistry.getRegisteredTestModuleSymbolOrThrow();
        return symbol.name;
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

    public getSwiftTypeReferenceFromSourceModuleScope(typeReference: TypeReference): swift.TypeReference {
        const symbol = this.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        return this.getSwiftTypeReferenceFromScope(typeReference, symbol.id);
    }

    public getSwiftTypeReferenceFromTestModuleScope(typeReference: TypeReference): swift.TypeReference {
        const symbol = this.project.nameRegistry.getRegisteredTestModuleSymbolOrThrow();
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
                                const symbol = this.project.nameRegistry.getNestedLiteralEnumSymbolOrThrow(
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
                const toSymbol = this.project.nameRegistry.getSchemaTypeSymbolOrThrow(typeReference.typeId);
                const symbolRef = this.project.nameRegistry.reference({ fromSymbol, toSymbol });
                return swift.TypeReference.symbol(symbolRef);
            }
            case "unknown":
                return referencer.referenceAsIsType("JSONValue");
            default:
                assertNever(typeReference);
        }
    }

    public inferCaseNameForTypeReference(parentSymbol: swift.Symbol, typeReference: swift.TypeReference): string {
        return inferCaseNameForTypeReference(parentSymbol, typeReference, this.project.nameRegistry);
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
        return new Referencer(this.project, fromSymbol);
    }
}
