import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import {
    IntermediateRepresentation,
    Literal,
    Name,
    TypeReference,
    TypeId,
    TypeDeclaration,
    Subpackage,
    SubpackageId,
    FernFilepath,
    PrimitiveTypeV1,
    ObjectTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { PhpProject } from "../project";
import { camelCase, upperFirst } from "lodash-es";
import { PhpTypeMapper } from "./PhpTypeMapper";
import { PhpAttributeMapper } from "./PhpAttributeMapper";
import { AsIsFiles } from "../AsIs";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { php } from "..";
import { GLOBAL_NAMESPACE, TESTS_ROOT_NAMESPACE } from "../ast/core/Constant";
import { TRAITS_DIRECTORY } from "../constants";

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
        return `${this.getRootNamespace()}\\Tests`;
    }

    public getCoreNamespace(): string {
        return `${this.getRootNamespace()}\\Core`;
    }

    public getUtilNamespace(): string {
        return `${this.getRootNamespace()}\\Utils`;
    }

    public getCoreClientNamespace(): string {
        return `${this.getCoreNamespace()}\\Client`;
    }

    public getCoreMultipartNamespace(): string {
        return `${this.getCoreNamespace()}\\Multipart`;
    }

    public getUtilMultipartNamespace(): string {
        return `${this.getRootNamespace()}\\Utils\\Multipart`;
    }

    public getCoreJsonNamespace(): string {
        return `${this.getCoreNamespace()}\\Json`;
    }

    public getCoreTypesNamespace(): string {
        return `${this.getCoreNamespace()}\\Types`;
    }

    public getCoreTestsNamespace(): string {
        return `${this.getRootNamespace()}\\${TESTS_ROOT_NAMESPACE}\\Core`;
    }

    public getUtilTestsNamespace(): string {
        return `${this.getRootNamespace()}\\${TESTS_ROOT_NAMESPACE}\\Utils`;
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

    public getDateTypeAttributeClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("DateType");
    }

    public getConstantClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("Constant");
    }

    public getJsonPropertyAttributeClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonProperty");
    }

    public getSerializableTypeClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("SerializableType");
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

    public getCoreMultipartClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getCoreMultipartNamespace()
        });
    }

    public getCoreJsonClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getCoreJsonNamespace()
        });
    }

    public getCoreTypesClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getCoreTypesNamespace()
        });
    }

    public getUtilMultipartClassReference(name: string): php.ClassReference {
        return php.classReference({
            name,
            namespace: this.getUtilMultipartNamespace()
        });
    }

    public isMixedArray(type: php.Type): boolean {
        return (
            type.internalType.type === "array" && type.internalType.value.underlyingType().internalType.type === "mixed"
        );
    }

    public isSequence(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isSequence(typeReference.container.optional);
                }
                return ["list", "set"].includes(typeReference.container.type);
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isSequence(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return false;
        }
    }

    public isMap(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isMap(typeReference.container.optional);
                }
                return typeReference.container.type === "map";
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isMap(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return false;
        }
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

    public isObject(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isObject(typeReference.container.optional);
                }
                if (typeReference.container.type === "list") {
                    return this.isObject(typeReference.container.list);
                }
                if (typeReference.container.type === "set") {
                    return this.isObject(typeReference.container.set);
                }
                return false;
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                return this.typeDeclarationIsObject(declaration);
            }
            case "primitive": {
                return false;
            }
            case "unknown": {
                return false;
            }
        }
    }

    public isUnknown(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.isUnknown(typeReference.container.optional);
                }
                if (typeReference.container.type === "list") {
                    return this.isUnknown(typeReference.container.list);
                }
                if (typeReference.container.type === "set") {
                    return this.isUnknown(typeReference.container.set);
                }
                return false;
            case "named": {
                return false;
            }
            case "primitive": {
                return false;
            }
            case "unknown": {
                return true;
            }
        }
    }

    public typeDeclarationIsEnum(declaration: TypeDeclaration): boolean {
        if (declaration.shape.type === "alias") {
            return this.isEnum(declaration.shape.aliasOf);
        }
        return declaration.shape.type === "enum";
    }

    public typeDeclarationIsObject(declaration: TypeDeclaration): boolean {
        if (declaration.shape.type === "alias") {
            return this.isObject(declaration.shape.aliasOf);
        }
        return declaration.shape.type === "object";
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
    public abstract getUtilAsIsFiles(): string[];
    public abstract getUtilTestAsIsFiles(): string[];

    public getCoreSerializationAsIsFiles(): string[] {
        return [
            AsIsFiles.ArrayType,
            AsIsFiles.Constant,
            AsIsFiles.DateType,
            AsIsFiles.JsonProperty,
            AsIsFiles.SerializableType,
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
            AsIsFiles.DateArrayTypeTest,
            AsIsFiles.EmptyArraysTest,
            AsIsFiles.InvalidTypesTest,
            AsIsFiles.TraitTest,
            AsIsFiles.MixedDateArrayTypeTest,
            AsIsFiles.NestedUnionArrayTypeTest,
            AsIsFiles.NullableArrayTypeTest,
            AsIsFiles.NullPropertyTypeTest,
            AsIsFiles.ScalarTypesTest,
            AsIsFiles.TestTypeTest,
            AsIsFiles.UnionArrayTypeTest,
            AsIsFiles.EnumTest,
            AsIsFiles.UnionPropertyTypeTest
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
