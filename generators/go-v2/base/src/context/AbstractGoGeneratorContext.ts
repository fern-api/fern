import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorNotificationService
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";

import {
    EnumTypeDeclaration,
    ErrorDeclaration,
    ErrorId,
    FernFilepath,
    HttpService,
    IntermediateRepresentation,
    Literal,
    Name,
    PrimitiveTypeV1,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { BaseGoCustomConfigSchema, go, resolveRootImportPath } from "@fern-api/go-ast";
import { GoTypeMapper } from "./GoTypeMapper";
import { GoValueFormatter } from "./GoValueFormatter";
import { GoZeroValueMapper } from "./GoZeroValueMapper";
import { GoProject } from "../project/GoProject";

export interface FileLocation {
    importPath: string;
    directory: RelativeFilePath;
}

export abstract class AbstractGoGeneratorContext<
    CustomConfig extends BaseGoCustomConfigSchema
> extends AbstractGeneratorContext {
    private rootImportPath: string;
    public readonly project: GoProject;
    public readonly goTypeMapper: GoTypeMapper;
    public readonly goValueFormatter: GoValueFormatter;
    public readonly goZeroValueMapper: GoZeroValueMapper;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new GoProject({ context: this });
        this.goTypeMapper = new GoTypeMapper(this);
        this.goValueFormatter = new GoValueFormatter(this);
        this.goZeroValueMapper = new GoZeroValueMapper(this);
        this.rootImportPath = resolveRootImportPath({
            config: this.config,
            customConfig: this.customConfig
        });
    }

    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        return service;
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage with id ${subpackageId} not found`);
        }
        return subpackage;
    }

    public getErrorDeclarationOrThrow(errorId: ErrorId): ErrorDeclaration {
        const errorDeclaration = this.ir.errors[errorId];
        if (errorDeclaration == null) {
            throw new Error(`Error declaration with id ${errorId} not found`);
        }
        return errorDeclaration;
    }

    public getClassName(name: Name): string {
        return name.pascalCase.unsafeName;
    }

    public getPackageName(name: Name): string {
        return name.snakeCase.unsafeName.toLowerCase();
    }

    public getFilename(name: Name): string {
        return name.snakeCase.unsafeName;
    }

    public getReceiverName(name: Name): string {
        return name.camelCase.unsafeName.charAt(0).toUpperCase();
    }

    public getRootImportPath(): string {
        return this.rootImportPath;
    }

    public getRootPackageName(): string {
        if (this.customConfig.packageName != null) {
            return this.customConfig.packageName;
        }
        return this.ir.apiName.camelCase.safeName.toLowerCase();
    }

    public getCoreImportPath(): string {
        return `${this.rootImportPath}/core`;
    }

    public getInternalImportPath(): string {
        return `${this.rootImportPath}/internal`;
    }

    public getOptionImportPath(): string {
        return `${this.rootImportPath}/option`;
    }

    public getFieldName(name: Name): string {
        return name.pascalCase.unsafeName;
    }

    public getParameterName(name: Name): string {
        return name.camelCase.safeName;
    }

    public maybeUnwrapIterable(typeReference: TypeReference): TypeReference | undefined {
        switch (typeReference.type) {
            case "container": {
                const container = typeReference.container;
                switch (container.type) {
                    case "list":
                        return container.list;
                    case "set":
                        return container.set;
                    case "optional":
                        return this.maybeUnwrapIterable(container.optional);
                    case "nullable":
                        return this.maybeUnwrapIterable(container.nullable);
                    case "literal":
                    case "map":
                        return undefined;
                    default:
                        assertNever(container);
                }
            }
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId).shape;
                switch (typeDeclaration.type) {
                    case "alias":
                        return this.maybeUnwrapIterable(typeDeclaration.aliasOf);
                    case "enum":
                    case "object":
                    case "union":
                    case "undiscriminatedUnion":
                        return undefined;
                    default:
                        assertNever(typeDeclaration);
                }
            }
            case "primitive":
            case "unknown":
                return undefined;
            default:
                assertNever(typeReference);
        }
    }

    public maybeUnwrapOptionalOrNullable(typeReference: TypeReference): TypeReference | undefined {
        switch (typeReference.type) {
            case "container": {
                const container = typeReference.container;
                switch (container.type) {
                    case "optional":
                        return container.optional;
                    case "nullable":
                        return container.nullable;
                    case "list":
                    case "set":
                    case "literal":
                    case "map":
                        return undefined;
                    default:
                        assertNever(container);
                }
            }
            case "named":
            case "primitive":
            case "unknown":
                return undefined;
            default:
                assertNever(typeReference);
        }
    }

    /**
     * Returns true if the type reference needs to be dereferenced to get the
     * underlying type.
     *
     * Container types like lists, maps, and sets are already nil-able, so they
     * don't require a dereference prefix.
     */
    public needsOptionalDereference(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId).shape;
                switch (typeDeclaration.type) {
                    case "alias":
                        return this.needsOptionalDereference(typeDeclaration.aliasOf);
                    case "enum":
                        return true;
                    case "object":
                    case "union":
                    case "undiscriminatedUnion":
                        return false;
                    default:
                        assertNever(typeDeclaration);
                }
            }
            case "container": {
                const containerType = typeReference.container;
                switch (containerType.type) {
                    case "optional":
                        return this.needsOptionalDereference(containerType.optional);
                    case "nullable":
                        return this.needsOptionalDereference(containerType.nullable);
                    case "literal":
                        return true;
                    case "list":
                    case "set":
                    case "map":
                        return false;
                    default:
                        assertNever(containerType);
                }
            }
            case "primitive":
                return true;
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public getLiteralAsString(literal: Literal): string {
        return literal.type === "string" ? `"${literal.string}"` : literal.boolean ? '"true"' : '"false"';
    }

    public getContextTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "Context",
            importPath: "context"
        });
    }

    public getZeroTime(): go.TypeInstantiation {
        return go.TypeInstantiation.struct({
            typeReference: go.TimeTypeReference,
            fields: []
        });
    }

    public getZeroUuid(): go.TypeInstantiation {
        return go.TypeInstantiation.struct({
            typeReference: go.UuidTypeReference,
            fields: []
        });
    }

    public getUuidTypeReference(): go.TypeReference {
        return go.UuidTypeReference;
    }

    public getTimeTypeReference(): go.TypeReference {
        return go.TimeTypeReference;
    }

    public getIoReaderTypeReference(): go.TypeReference {
        return go.IoReaderTypeReference;
    }

    public isOptional(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                switch (typeReference.container.type) {
                    case "optional":
                        return true;
                    case "nullable":
                        return this.isOptional(typeReference.container.nullable);
                }
                return false;
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isOptional(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive":
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public isNullable(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                switch (typeReference.container.type) {
                    case "nullable":
                        return true;
                    case "optional":
                        return this.isNullable(typeReference.container.optional);
                }
                return false;
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isNullable(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive":
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public isEnum(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                switch (typeReference.container.type) {
                    case "optional":
                        return this.isEnum(typeReference.container.optional);
                    case "nullable":
                        return this.isEnum(typeReference.container.nullable);
                }
                return false;
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                return this.typeDeclarationIsEnum(declaration);
            }
            case "primitive":
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public typeDeclarationIsEnum(declaration: TypeDeclaration): boolean {
        if (declaration.shape.type === "alias") {
            return this.isEnum(declaration.shape.aliasOf);
        }
        return declaration.shape.type === "enum";
    }

    public isDate(typeReference: TypeReference): boolean {
        return this.isPrimitive({ typeReference, primitive: PrimitiveTypeV1.Date });
    }

    public isDateTime(typeReference: TypeReference): boolean {
        return this.isPrimitive({ typeReference, primitive: PrimitiveTypeV1.DateTime });
    }

    public isPrimitive({
        typeReference,
        primitive
    }: {
        typeReference: TypeReference;
        primitive: PrimitiveTypeV1;
    }): boolean {
        return this.maybePrimitive(typeReference) === primitive;
    }

    public maybeEnum(typeReference: TypeReference): EnumTypeDeclaration | undefined {
        if (typeReference.type === "named") {
            const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
            if (declaration.shape.type === "enum") {
                return declaration.shape;
            }
            if (declaration.shape.type === "alias") {
                return this.maybeEnum(declaration.shape.aliasOf);
            }
        }
        if (typeReference.type === "container" && typeReference.container.type === "optional") {
            return this.maybeEnum(typeReference.container.optional);
        }
        if (typeReference.type === "container" && typeReference.container.type === "nullable") {
            return this.maybeEnum(typeReference.container.nullable);
        }
        return undefined;
    }

    public maybePrimitive(typeReference: TypeReference): PrimitiveTypeV1 | undefined {
        switch (typeReference.type) {
            case "container": {
                const container = typeReference.container;
                switch (container.type) {
                    case "optional":
                        return this.maybePrimitive(container.optional);
                    case "nullable":
                        return this.maybePrimitive(container.nullable);
                    case "list":
                    case "set":
                    case "literal":
                    case "map":
                        return undefined;
                    default:
                        assertNever(container);
                }
            }
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "alias") {
                    return this.maybePrimitive(declaration.shape.aliasOf);
                }
                return undefined;
            }
            case "primitive": {
                return typeReference.primitive.v1;
            }
            case "unknown": {
                return undefined;
            }
            default:
                assertNever(typeReference);
        }
    }

    public maybeLiteral(typeReference: TypeReference): Literal | undefined {
        if (typeReference.type === "container" && typeReference.container.type === "literal") {
            return typeReference.container.literal;
        }
        return undefined;
    }
    
    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.getTypeDeclaration(typeId);
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return typeDeclaration;
    }

    public getTypeDeclaration(typeId: TypeId): TypeDeclaration | undefined {
        return this.ir.types[typeId];
    }

    public getLocationForTypeId(typeId: TypeId): FileLocation {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getPackageLocation(typeDeclaration.name.fernFilepath);
    }

    public getLocationForErrorId(errorId: ErrorId): FileLocation {
        const errorDeclaration = this.getErrorDeclarationOrThrow(errorId);
        return this.getPackageLocation(errorDeclaration.name.fernFilepath);
    }

    public getPackageLocation(filepath: FernFilepath, suffix?: string): FileLocation {
        return this.getLocation(filepath.packagePath, suffix);
    }

    protected getFileLocation(filepath: FernFilepath, suffix?: string): FileLocation {
        return this.getLocation(filepath.allParts, suffix);
    }

    private getLocation(names: Name[], suffix?: string): FileLocation {
        let parts = names.map((name) => name.camelCase.safeName.toLowerCase());
        parts = suffix != null ? [...parts, suffix] : parts;
        return {
            importPath: [this.getRootImportPath(), ...parts].join("/"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }
}
