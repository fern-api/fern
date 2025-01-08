import { camelCase, upperFirst } from "lodash-es";

import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";

import {
    ContainerType,
    FernFilepath,
    IntermediateRepresentation,
    Literal,
    MapType,
    Name,
    NamedType,
    ObjectTypeDeclaration,
    PrimitiveType,
    PrimitiveTypeV1,
    Subpackage,
    SubpackageId,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { php } from "..";
import { AsIsFiles } from "../AsIs";
import { Type } from "../ast";
import { GLOBAL_NAMESPACE } from "../ast/core/Constant";
import { TRAITS_DIRECTORY } from "../constants";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { PhpProject } from "../project";
import { PhpAttributeMapper } from "./PhpAttributeMapper";
import { PhpTypeMapper } from "./PhpTypeMapper";

export interface FileLocation {
    namespace: string;
    directory: RelativeFilePath;
}

export abstract class AbstractPhpGeneratorContext<
    CustomConfig extends BasePhpCustomConfigSchema
> extends AbstractGeneratorContext {
    private rootNamespace: string;
    public readonly phpTypeMapper: PhpTypeMapper;
    public readonly phpAttributeMapper: PhpAttributeMapper;
    public readonly project: PhpProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.rootNamespace = this.customConfig.namespace ?? upperFirst(camelCase(`${this.config.organization}`));
        this.phpTypeMapper = new PhpTypeMapper(this);
        this.phpAttributeMapper = new PhpAttributeMapper(this);
        this.project = new PhpProject({
            context: this,
            name: this.rootNamespace
        });
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage with id ${subpackageId} not found`);
        }
        return subpackage;
    }

    public getDateFormat(): php.AstNode {
        return php.codeblock((writer) => {
            writer.writeNode(this.getConstantClassReference());
            writer.write("::DateFormat");
        });
    }

    public getDateTimeFormat(): php.AstNode {
        return php.codeblock((writer) => {
            writer.writeNode(this.getConstantClassReference());
            writer.write("::DateTimeFormat");
        });
    }

    public getClassName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getGlobalNamespace(): string {
        return GLOBAL_NAMESPACE;
    }

    public getRootNamespace(): string {
        return this.rootNamespace;
    }

    public getTestsNamespace(): string {
        return `${this.rootNamespace}\\Tests`;
    }

    public getCoreNamespace(): string {
        return `${this.rootNamespace}\\Core`;
    }

    public getCoreClientNamespace(): string {
        return `${this.getCoreNamespace()}\\Client`;
    }

    public getCoreJsonNamespace(): string {
        return `${this.getCoreNamespace()}\\Json`;
    }

    public getCoreMultipartNamespace(): string {
        return `${this.getCoreNamespace()}\\Multipart`;
    }

    public getCoreTypesNamespace(): string {
        return `${this.getCoreNamespace()}\\Types`;
    }

    public getCoreTestsNamespace(): string {
        return `${this.rootNamespace}\\Tests\\Core`;
    }

    public getUtilsTypesNamespace(): string {
        return `${this.rootNamespace}\\Utils`;
    }

    public getCoreClientTestsNamespace(): string {
        return `${this.getCoreTestsNamespace()}\\Client`;
    }

    public getCoreJsonTestsNamespace(): string {
        return `${this.getCoreTestsNamespace()}\\Json`;
    }

    public getCoreTypesTestsNamespace(): string {
        return `${this.getCoreTestsNamespace()}\\Types`;
    }

    public getParameterName(name: Name): string {
        return this.prependUnderscoreIfNeeded(name.camelCase.unsafeName);
    }

    public getPropertyName(name: Name): string {
        return this.prependUnderscoreIfNeeded(name.camelCase.unsafeName);
    }

    private prependUnderscoreIfNeeded(input: string): string {
        // https://www.php.net/manual/en/language.variables.basics.php
        if (!/^[a-zA-Z_]/.test(input)) {
            return `_${input}`;
        }
        return input;
    }

    public getLiteralAsString(literal: Literal): string {
        return literal.type === "string" ? `'${literal.string}'` : literal.boolean ? "'true'" : "'false'";
    }

    public getThrowableClassReference(): php.ClassReference {
        return php.classReference({
            namespace: GLOBAL_NAMESPACE,
            name: "Throwable"
        });
    }

    public getDateAttributeClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("Date");
    }

    public getConstantClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("Constant");
    }

    public getJsonPropertyAttributeClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonProperty");
    }

    public getJsonSerializableTypeClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonSerializableType");
    }

    public getUnionClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("Union");
    }

    public getArrayTypeClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("ArrayType");
    }

    public getCoreClientClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getCoreClientNamespace()
        });
    }

    public getCoreJsonClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getCoreJsonNamespace()
        });
    }

    public getCoreMultipartClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getCoreMultipartNamespace()
        });
    }

    public getUtilsClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getUtilsTypesNamespace()
        });
    }

    public getCoreTypesClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getCoreTypesNamespace()
        });
    }

    public isMixedArray(type: php.Type): boolean {
        return (
            type.internalType.type === "array" && type.internalType.value.underlyingType().internalType.type === "mixed"
        );
    }

    public isOptional(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                return typeReference.container.type === "optional";
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isOptional(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return false;
        }
    }

    public dereferenceOptional(typeReference: TypeReference): TypeReference {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return typeReference.container.optional;
                }
                return typeReference;
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.dereferenceOptional(typeDeclaration.shape.aliasOf);
                }
                return typeReference;
            }
            case "unknown":
            case "primitive":
                return typeReference;
        }
    }

    public dereferenceCollection(typeReference: TypeReference): TypeReference {
        switch (typeReference.type) {
            case "container": {
                if (typeReference.container.type === "list") {
                    return this.dereferenceCollection(typeReference.container.list);
                } else if (typeReference.container.type === "set") {
                    return this.dereferenceCollection(typeReference.container.set);
                }
                return typeReference;
            }
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.dereferenceCollection(typeDeclaration.shape.aliasOf);
                }
                return typeReference;
            }
            case "primitive":
            case "unknown":
                return typeReference;
        }
    }

    public isCollection(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                return typeReference.container.type === "list" || typeReference.container.type === "set";
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isCollection(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive":
            case "unknown":
                return false;
        }
    }

    public isJsonEncodable(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                return typeReference.container.type === "map";
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isJsonEncodable(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive":
                return false;
            case "unknown":
                return true;
        }
    }

    public hasToJsonMethod(typeReference: TypeReference): boolean {
        return typeReference.type === "named" && !this.isPrimitive(typeReference) && !this.isEnum(typeReference);
    }

    public isEnum(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isEnum(typeReference.container.optional);
                }
                return false;
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                return this.typeDeclarationIsEnum(declaration);
            }
            case "primitive": {
                return false;
            }
            case "unknown": {
                return false;
            }
        }
    }

    public typeDeclarationIsEnum(declaration: TypeDeclaration): boolean {
        if (declaration.shape.type === "alias") {
            return this.isEnum(declaration.shape.aliasOf);
        }
        return declaration.shape.type === "enum";
    }

    public isPrimitive(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "primitive": {
                return true;
            }
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "alias") {
                    return this.isPrimitive(declaration.shape.aliasOf);
                }
                return false;
            }
            default: {
                return false;
            }
        }
    }

    public isEquivalentToPrimitive({
        typeReference,
        primitive
    }: {
        typeReference: TypeReference;
        primitive?: PrimitiveTypeV1;
    }): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isDate(typeReference.container.optional);
                }
                return false;
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "alias") {
                    return this.isDate(declaration.shape.aliasOf);
                }
                return false;
            }
            case "primitive": {
                if (primitive == null) {
                    return true;
                }
                return typeReference.primitive.v1 === primitive;
            }
            case "unknown": {
                return false;
            }
        }
    }

    public isDate(typeReference: TypeReference): boolean {
        return this.isEquivalentToPrimitive({ typeReference, primitive: PrimitiveTypeV1.Date });
    }

    public isDateTime(typeReference: TypeReference): boolean {
        return this.isEquivalentToPrimitive({ typeReference, primitive: PrimitiveTypeV1.DateTime });
    }

    public getUnderlyingObjectTypeDeclaration(typeReference: TypeReference): ObjectTypeDeclaration {
        switch (typeReference.type) {
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "alias") {
                    return this.getUnderlyingObjectTypeDeclaration(declaration.shape.aliasOf);
                }
                if (declaration.shape.type === "object") {
                    return declaration.shape;
                }
                throw new Error("Type is not an object type");
            }
            case "primitive":
            case "unknown":
            case "container":
        }
        throw new Error("Type is not an object type");
    }

    public getUnderlyingObjectTypeDeclarationOrThrow(typeDeclaration: TypeDeclaration): ObjectTypeDeclaration {
        if (typeDeclaration.shape.type === "alias") {
            return this.getUnderlyingObjectTypeDeclaration(typeDeclaration.shape.aliasOf);
        }
        if (typeDeclaration.shape.type === "object") {
            return typeDeclaration.shape;
        }
        throw new Error("Type is not an object type");
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

    public abstract getRawAsIsFiles(): string[];
    public abstract getCoreAsIsFiles(): string[];
    public abstract getCoreTestAsIsFiles(): string[];
    public abstract getUtilsAsIsFiles(): string[];

    public getCoreSerializationAsIsFiles(): string[] {
        return [
            AsIsFiles.ArrayType,
            AsIsFiles.Constant,
            AsIsFiles.Date,
            AsIsFiles.JsonProperty,
            AsIsFiles.JsonSerializableType,
            AsIsFiles.Union,
            AsIsFiles.JsonDecoder,
            AsIsFiles.JsonEncoder,
            AsIsFiles.JsonDeserializer,
            AsIsFiles.JsonSerializer,
            AsIsFiles.Utils
        ];
    }

    public getCoreSerializationTestAsIsFiles(): string[] {
        return [
            AsIsFiles.DateArrayTest,
            AsIsFiles.EmptyArrayTest,
            AsIsFiles.EnumTest,
            AsIsFiles.ExhaustiveTest,
            AsIsFiles.InvalidTest,
            AsIsFiles.NestedUnionArrayTest,
            AsIsFiles.NullableArrayTest,
            AsIsFiles.NullPropertyTest,
            AsIsFiles.ScalarTypesTest,
            AsIsFiles.TraitTest,
            AsIsFiles.UnionArrayTest,
            AsIsFiles.UnionPropertyTest
        ];
    }

    public abstract getLocationForTypeId(typeId: TypeId): FileLocation;

    public getTraitLocationForTypeId(typeId: TypeId): FileLocation {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getFileLocation(typeDeclaration.name.fernFilepath, TRAITS_DIRECTORY);
    }

    protected getFileLocation(filepath: FernFilepath, suffix?: string): FileLocation {
        let parts = filepath.allParts.map((path) => path.pascalCase.safeName);
        parts = suffix != null ? [...parts, suffix] : parts;
        return {
            namespace: [this.getRootNamespace(), ...parts].join("\\"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }
}
