import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BasePhpCustomConfigSchema, GLOBAL_NAMESPACE, getSafeClassName, php, SELF } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { camelCase, upperFirst } from "lodash-es";
import { AsIsFiles } from "../AsIs.js";
import { TRAITS_DIRECTORY } from "../constants.js";
import { PhpProject } from "../project/PhpProject.js";
import { PhpAttributeMapper } from "./PhpAttributeMapper.js";
import { PhpTypeMapper } from "./PhpTypeMapper.js";

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
        public readonly ir: FernIr.IntermediateRepresentation,
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

    public getPackageName(): string {
        if (this.customConfig.packageName != null) {
            return this.customConfig.packageName;
        }
        return `${this.config.organization}/${this.config.organization}`;
    }

    public getSubpackageOrThrow(subpackageId: FernIr.SubpackageId): FernIr.Subpackage {
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

    public getClassName(name: FernIr.Name): string {
        return getSafeClassName(name.pascalCase.safeName);
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

    public getCorePaginationNamespace(): string {
        return `${this.getCoreNamespace()}\\Pagination`;
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

    public getParameterName(name: FernIr.Name): string {
        return this.prependUnderscoreIfNeeded(name.camelCase.unsafeName);
    }

    public getFieldName(name: FernIr.Name): string {
        return this.prependUnderscoreIfNeeded(name.camelCase.unsafeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        return this.prependUnderscoreIfNeeded(name.camelCase.unsafeName);
    }

    public getVariableName(name: FernIr.Name): string {
        return "$" + this.getPropertyName(name);
    }

    public getPropertyGetterName(name: FernIr.Name): string {
        return `get${name.pascalCase.unsafeName}`;
    }

    public getPropertySetterName(name: FernIr.Name): string {
        return `set${name.pascalCase.unsafeName}`;
    }

    public getToStringMethod(): php.Method {
        return php.method({
            name: "__toString",
            access: "public",
            parameters: [],
            return_: php.Type.string(),
            body: php.codeblock((writer) => {
                writer.write("return ");
                writer.writeNode(
                    php.invokeMethod({
                        on: php.this_(),
                        method: "toJson",
                        arguments_: []
                    })
                );
                writer.writeLine(";");
            })
        });
    }

    private prependUnderscoreIfNeeded(input: string): string {
        // https://www.php.net/manual/en/language.variables.basics.php
        if (!/^[a-zA-Z_]/.test(input)) {
            return `_${input}`;
        }
        return input;
    }

    public getLiteralAsString(literal: FernIr.Literal): string {
        return literal.type === "string" ? `'${literal.string}'` : literal.boolean ? "'true'" : "'false'";
    }

    public getThrowableClassReference(): php.ClassReference {
        return php.classReference({
            namespace: GLOBAL_NAMESPACE,
            name: "Throwable"
        });
    }

    public getExceptionClassReference(): php.ClassReference {
        return php.classReference({
            namespace: GLOBAL_NAMESPACE,
            name: "Exception"
        });
    }

    public getDateAttributeClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("Date");
    }

    public getConstantClassReference(): php.ClassReference {
        return this.getCoreTypesClassReference("Constant");
    }

    public getJsonDecoderClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonDecoder");
    }

    public getJsonDeserializerClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonDeserializer");
    }

    public getJsonPropertyAttributeClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonProperty");
    }

    public getJsonSerializableTypeClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonSerializableType");
    }

    public getJsonSerializerClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonSerializer");
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

    public isOptional(typeReference: FernIr.TypeReference): boolean {
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

    public isNullable(typeReference: FernIr.TypeReference): boolean {
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

    public dereferenceOptional(typeReference: FernIr.TypeReference): FernIr.TypeReference {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return typeReference.container.optional;
                }
                if (typeReference.container.type === "nullable") {
                    return this.dereferenceOptional(typeReference.container.nullable);
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
            default:
                assertNever(typeReference);
        }
    }

    public dereferenceCollection(typeReference: FernIr.TypeReference): FernIr.TypeReference {
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
            default:
                assertNever(typeReference);
        }
    }

    public isCollection(typeReference: FernIr.TypeReference): boolean {
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
            default:
                assertNever(typeReference);
        }
    }

    public isJsonEncodable(typeReference: FernIr.TypeReference): boolean {
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
            default:
                assertNever(typeReference);
        }
    }

    public hasToJsonMethod(typeReference: FernIr.TypeReference): boolean {
        return typeReference.type === "named" && !this.isPrimitive(typeReference) && !this.isEnum(typeReference);
    }

    public isEnum(typeReference: FernIr.TypeReference): boolean {
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
            default:
                assertNever(typeReference);
        }
    }

    public typeDeclarationIsEnum(declaration: FernIr.TypeDeclaration): boolean {
        if (declaration.shape.type === "alias") {
            return this.isEnum(declaration.shape.aliasOf);
        }
        return declaration.shape.type === "enum";
    }

    public isPrimitive(typeReference: FernIr.TypeReference): boolean {
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
        typeReference: FernIr.TypeReference;
        primitive?: FernIr.PrimitiveTypeV1;
    }): boolean {
        switch (typeReference.type) {
            case "container":
                switch (typeReference.container.type) {
                    case "optional":
                        return this.isEquivalentToPrimitive({
                            typeReference: typeReference.container.optional,
                            primitive
                        });
                    case "nullable":
                        return this.isEquivalentToPrimitive({
                            typeReference: typeReference.container.nullable,
                            primitive
                        });
                }
                return false;
            case "named": {
                const declaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "alias") {
                    return this.isEquivalentToPrimitive({ typeReference: declaration.shape.aliasOf, primitive });
                }
                return false;
            }
            case "primitive": {
                if (primitive == null) {
                    return true;
                }
                return typeReference.primitive.v1 === primitive;
            }
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public isDate(typeReference: FernIr.TypeReference): boolean {
        return this.isEquivalentToPrimitive({ typeReference, primitive: FernIr.PrimitiveTypeV1.Date });
    }

    public isDateTime(typeReference: FernIr.TypeReference): boolean {
        return this.isEquivalentToPrimitive({ typeReference, primitive: FernIr.PrimitiveTypeV1.DateTime });
    }

    public getUnderlyingObjectTypeDeclaration(typeReference: FernIr.TypeReference): FernIr.ObjectTypeDeclaration {
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

    public getUnderlyingObjectTypeDeclarationOrThrow(
        typeDeclaration: FernIr.TypeDeclaration
    ): FernIr.ObjectTypeDeclaration {
        if (typeDeclaration.shape.type === "alias") {
            return this.getUnderlyingObjectTypeDeclaration(typeDeclaration.shape.aliasOf);
        }
        if (typeDeclaration.shape.type === "object") {
            return typeDeclaration.shape;
        }
        throw new Error("Type is not an object type");
    }

    public maybeLiteral(typeReference: FernIr.TypeReference): FernIr.Literal | undefined {
        if (typeReference.type === "container" && typeReference.container.type === "literal") {
            return typeReference.container.literal;
        }
        return undefined;
    }

    public getTypeDeclarationOrThrow(typeId: FernIr.TypeId): FernIr.TypeDeclaration {
        const typeDeclaration = this.getTypeDeclaration(typeId);
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return typeDeclaration;
    }

    public getTypeDeclaration(typeId: FernIr.TypeId): FernIr.TypeDeclaration | undefined {
        return this.ir.types[typeId];
    }

    public shouldGenerateGetterMethods(): boolean {
        const propertyAccess = this.getPropertyAccess();
        return propertyAccess === php.Access.Protected || propertyAccess === php.Access.Private;
    }

    public shouldGenerateSetterMethods(): boolean {
        const propertyAccess = this.getPropertyAccess();
        return propertyAccess === php.Access.Protected || propertyAccess === php.Access.Private;
    }

    public getGetterMethod({ name, field }: { name: FernIr.Name; field: php.Field }): php.Method {
        return php.method({
            name: this.getPropertyGetterName(name),
            access: php.Access.Public,
            parameters: [],
            return_: field.type,
            body: php.codeblock((writer) => {
                writer.write(`return $this->${this.getPropertyName(name)};`);
            })
        });
    }

    public getSetterMethod({ name, field }: { name: FernIr.Name; field: php.Field }): php.Method {
        const propertyName = this.getPropertyName(name);
        return php.method({
            name: this.getPropertySetterName(name),
            access: php.Access.Public,
            parameters: [php.parameter({ name: "value", type: field.type })],
            return_: SELF,
            body: php.codeblock((writer) => {
                writer.writeLine(`$this->${propertyName} = $value;`);
                writer.writeLine(`$this->_setField('${propertyName}');`);
                writer.write("return $this;");
            })
        });
    }

    public getPropertyAccess(): php.Access {
        const propertyAccess = this.customConfig.propertyAccess;
        if (propertyAccess == null) {
            return php.Access.Public;
        }
        switch (propertyAccess) {
            case "public":
                return php.Access.Public;
            case "private":
                return php.Access.Private;
            default:
                assertNever(propertyAccess);
        }
    }

    public abstract getRawAsIsFiles(): string[];
    public abstract getCoreAsIsFiles(): string[];
    public abstract getCoreTestAsIsFiles(): string[];
    public abstract getUtilsAsIsFiles(): string[];

    /**
     * Returns extra template variables for a given filename.
     * Override this method to provide custom template variables for specific files.
     */
    public getExtraTemplateVarsForFile(_filename: string): Record<string, string> | undefined {
        return undefined;
    }

    public getCoreSerializationAsIsFiles(): string[] {
        return [
            AsIsFiles.ArrayType,
            AsIsFiles.Constant,
            AsIsFiles.Date,
            AsIsFiles.JsonEncoder,
            AsIsFiles.JsonDecoder,
            AsIsFiles.JsonDeserializer,
            AsIsFiles.JsonProperty,
            AsIsFiles.JsonSerializableType,
            AsIsFiles.JsonSerializer,
            AsIsFiles.Union,
            AsIsFiles.Utils
        ];
    }

    public getCoreSerializationTestAsIsFiles(): string[] {
        return [
            AsIsFiles.AdditionalPropertiesTest,
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

    public abstract getLocationForTypeId(typeId: FernIr.TypeId): FileLocation;

    public getTraitLocationForTypeId(typeId: FernIr.TypeId): FileLocation {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getFileLocation(typeDeclaration.name.fernFilepath, TRAITS_DIRECTORY);
    }

    protected getFileLocation(filepath: FernIr.FernFilepath, suffix?: string): FileLocation {
        let parts = filepath.allParts.map((path) => path.pascalCase.safeName);
        parts = suffix != null ? [...parts, suffix] : parts;
        return {
            namespace: [this.getRootNamespace(), ...parts].join("\\"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }
}
