import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertDefined, assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseSwiftCustomConfigSchema, swift } from "@fern-api/swift-codegen";
import {
    FernFilepath,
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

import { AsIsFileDefinition, AsIsFiles } from "../AsIs";
import { SwiftProject } from "../project";

/**
 * Registry for local type information used by individual generators to resolve type references
 * and handle nested type collisions within their specific context.
 */
export interface LocalTypeRegistry {
    getSwiftTypeForStringLiteral?: (literalValue: string) => swift.Type;
    hasNestedTypeWithName?: (symbolName: string) => boolean;
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
        this.registerSymbols(project, ir);
        return project;
    }

    /**
     * Register symbols in priority order - high-priority symbols first to avoid collisions.
     * Root client and environment symbols are registered first as they're most critical,
     * followed by schema types and inline request types which are commonly referenced, and
     * finally subclient symbols last since they're unlikely to be used directly by end users.
     */
    private registerSymbols(project: SwiftProject, ir: IntermediateRepresentation) {
        project.symbolRegistry.registerRootClientSymbol(ir.apiName.pascalCase.unsafeName);
        project.symbolRegistry.registerEnvironmentSymbol(ir.apiName.pascalCase.unsafeName);
        Object.entries(ir.types).forEach(([typeId, typeDeclaration]) => {
            project.symbolRegistry.registerSchemaTypeSymbol(typeId, typeDeclaration.name.name.pascalCase.unsafeName);
        });
        Object.entries(ir.services).forEach(([_, service]) => {
            service.endpoints.forEach((endpoint) => {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    project.symbolRegistry.registerInlineRequestTypeSymbol(
                        endpoint.id,
                        endpoint.requestBody.name.pascalCase.unsafeName
                    );
                }
            });
        });
        Object.entries(ir.subpackages).forEach(([subpackageId, subpackage]) => {
            project.symbolRegistry.registerSubClientSymbol(
                subpackageId,
                subpackage.fernFilepath.allParts.map((name) => name.pascalCase.unsafeName),
                subpackage.name.pascalCase.unsafeName
            );
        });
    }

    public get packageName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get libraryName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get targetName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get schemasDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Schemas");
    }

    public get requestsDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Requests");
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
        return Object.values(AsIsFiles);
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
                            boolean: () => swift.Type.jsonValue(), // TODO(kafkas): Handle this case
                            string: (literalValue) =>
                                localTypeRegistry?.getSwiftTypeForStringLiteral?.(literalValue) ??
                                swift.Type.jsonValue(),
                            _other: () => swift.Type.jsonValue()
                        }),
                    map: (type) =>
                        swift.Type.dictionary(
                            this.getSwiftTypeForTypeReference(type.keyType, localTypeRegistry),
                            this.getSwiftTypeForTypeReference(type.valueType, localTypeRegistry)
                        ),
                    // TODO(kafkas): Handle these cases
                    set: () => swift.Type.jsonValue(),
                    nullable: () => swift.Type.jsonValue(),
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
                    // TODO(kafkas): We may need to implement our own value type for this
                    bigInteger: () => swift.Type.string(),
                    date: () => swift.Type.date(),
                    dateTime: () => swift.Type.date(),
                    base64: () => swift.Type.string(),
                    uuid: () => swift.Type.uuid(),
                    _other: () => swift.Type.jsonValue()
                });
            case "named": {
                const symbolName = this.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeReference.typeId);
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

    public getFullyQualifiedNameForSchemaType(symbolName: string): string {
        return `${this.targetName}.${symbolName}`;
    }
}
