import {
    EnumTypeDeclaration,
    ExampleType,
    FernFilepath,
    ObjectTypeDeclaration,
    PrimitiveTypeV1,
    Type,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { Reference } from "@fern-typescript/commons";
import {
    BaseContext,
    GeneratedAliasType,
    GeneratedEnumType,
    GeneratedObjectType,
    GeneratedType,
    GeneratedUndiscriminatedUnionType,
    GeneratedUnionType
} from "@fern-typescript/contexts";

import { GeneratedAliasTypeImpl } from "./alias/GeneratedAliasTypeImpl";
import { GeneratedBrandedStringAliasImpl } from "./alias/GeneratedBrandedStringAliasImpl";
import { GeneratedEnumTypeImpl } from "./enum/GeneratedEnumTypeImpl";
import { GeneratedObjectTypeImpl } from "./object/GeneratedObjectTypeImpl";
import { GeneratedUndiscriminatedUnionTypeImpl } from "./undiscriminated-union/GeneratedUndiscriminatedUnionTypeImpl";
import { GeneratedUnionTypeImpl } from "./union/GeneratedUnionTypeImpl";

export declare namespace TypeGenerator {
    export interface Init {
        useBrandedStringAliases: boolean;
        includeUtilsOnUnionMembers: boolean;
        includeOtherInUnionTypes: boolean;
        enableForwardCompatibleEnums: boolean;
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
        retainOriginalCasing: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
    }

    export namespace generateType {
        export interface Args<Context> {
            typeName: string;
            shape: Type;
            examples: ExampleType[];
            docs: string | undefined;
            fernFilepath: FernFilepath;
            getReferenceToSelf: (context: Context) => Reference;
            includeSerdeLayer: boolean;
            retainOriginalCasing: boolean;
            inline: boolean;
        }
    }
}

export class TypeGenerator<Context extends BaseContext = BaseContext> {
    private readonly useBrandedStringAliases: boolean;
    private readonly includeUtilsOnUnionMembers: boolean;
    private readonly includeOtherInUnionTypes: boolean;
    private readonly enableForwardCompatibleEnums: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly noOptionalProperties: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly enableInlineTypes: boolean;
    private readonly generateReadWriteOnlyTypes: boolean;

    constructor({
        useBrandedStringAliases,
        includeUtilsOnUnionMembers,
        includeOtherInUnionTypes,
        enableForwardCompatibleEnums,
        includeSerdeLayer,
        noOptionalProperties,
        retainOriginalCasing,
        enableInlineTypes,
        generateReadWriteOnlyTypes
    }: TypeGenerator.Init) {
        this.useBrandedStringAliases = useBrandedStringAliases;
        this.includeUtilsOnUnionMembers = includeUtilsOnUnionMembers;
        this.includeOtherInUnionTypes = includeOtherInUnionTypes;
        this.enableForwardCompatibleEnums = enableForwardCompatibleEnums;
        this.includeSerdeLayer = includeSerdeLayer;
        this.noOptionalProperties = noOptionalProperties;
        this.retainOriginalCasing = retainOriginalCasing;
        this.enableInlineTypes = enableInlineTypes;
        this.generateReadWriteOnlyTypes = generateReadWriteOnlyTypes;
    }

    public generateType({
        shape,
        examples,
        typeName,
        docs,
        fernFilepath,
        getReferenceToSelf,
        inline
    }: TypeGenerator.generateType.Args<Context>): GeneratedType<Context> {
        return Type._visit<GeneratedType<Context>>(shape, {
            union: (shape) =>
                this.generateUnion({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf, inline }),
            undiscriminatedUnion: (shape) =>
                this.generateUndiscriminatedUnion({
                    typeName,
                    shape,
                    examples,
                    docs,
                    fernFilepath,
                    getReferenceToSelf
                }),
            object: (shape) =>
                this.generateObject({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf }),
            enum: (shape) => this.generateEnum({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf }),
            alias: (shape) =>
                this.generateAlias({
                    typeName,
                    aliasOf: shape.aliasOf,
                    examples,
                    docs,
                    fernFilepath,
                    getReferenceToSelf
                }),
            _other: () => {
                throw new Error("Unknown type declaration shape: " + shape.type);
            }
        });
    }

    private generateUndiscriminatedUnion({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf
    }: {
        typeName: string;
        shape: UndiscriminatedUnionTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedUndiscriminatedUnionType<Context> {
        return new GeneratedUndiscriminatedUnionTypeImpl({
            typeName,
            shape,
            examples,
            docs,
            fernFilepath,
            getReferenceToSelf,
            includeSerdeLayer: this.includeSerdeLayer,
            noOptionalProperties: this.noOptionalProperties,
            retainOriginalCasing: this.retainOriginalCasing,
            enableInlineTypes: this.enableInlineTypes,
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes
        });
    }

    private generateUnion({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf,
        inline
    }: {
        typeName: string;
        shape: UnionTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
        inline: boolean;
    }): GeneratedUnionType<Context> {
        return new GeneratedUnionTypeImpl({
            typeName,
            shape,
            examples,
            docs,
            fernFilepath,
            getReferenceToSelf,
            includeUtilsOnUnionMembers: this.includeUtilsOnUnionMembers,
            includeOtherInUnionTypes: this.includeOtherInUnionTypes,
            includeSerdeLayer: this.includeSerdeLayer,
            noOptionalProperties: this.noOptionalProperties,
            retainOriginalCasing: this.retainOriginalCasing,
            enableInlineTypes: this.enableInlineTypes,
            inline,
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes
        });
    }

    private generateObject({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf
    }: {
        typeName: string;
        shape: ObjectTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedObjectType<Context> {
        return new GeneratedObjectTypeImpl({
            typeName,
            shape,
            examples,
            docs,
            fernFilepath,
            getReferenceToSelf,
            includeSerdeLayer: this.includeSerdeLayer,
            noOptionalProperties: this.noOptionalProperties,
            retainOriginalCasing: this.retainOriginalCasing,
            enableInlineTypes: this.enableInlineTypes,
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes
        });
    }

    private generateEnum({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf
    }: {
        typeName: string;
        shape: EnumTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedEnumType<Context> {
        return new GeneratedEnumTypeImpl({
            typeName,
            shape,
            examples,
            docs,
            fernFilepath,
            getReferenceToSelf,
            includeSerdeLayer: this.includeSerdeLayer,
            noOptionalProperties: this.noOptionalProperties,
            includeEnumUtils: this.includeUtilsOnUnionMembers,
            enableForwardCompatibleEnums: this.enableForwardCompatibleEnums,
            retainOriginalCasing: this.retainOriginalCasing,
            enableInlineTypes: this.enableInlineTypes,
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes
        });
    }

    public generateAlias({
        typeName,
        aliasOf,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf
    }: {
        typeName: string;
        aliasOf: TypeReference;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedAliasType<Context> {
        return this.useBrandedStringAliases && isTypeStringLike(aliasOf)
            ? new GeneratedBrandedStringAliasImpl({
                  typeName,
                  shape: aliasOf,
                  examples,
                  docs,
                  fernFilepath,
                  getReferenceToSelf,
                  includeSerdeLayer: this.includeSerdeLayer,
                  noOptionalProperties: this.noOptionalProperties,
                  retainOriginalCasing: this.retainOriginalCasing,
                  enableInlineTypes: this.enableInlineTypes,
                  generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes
              })
            : new GeneratedAliasTypeImpl({
                  typeName,
                  shape: aliasOf,
                  examples,
                  docs,
                  fernFilepath,
                  getReferenceToSelf,
                  includeSerdeLayer: this.includeSerdeLayer,
                  noOptionalProperties: this.noOptionalProperties,
                  retainOriginalCasing: this.retainOriginalCasing,
                  enableInlineTypes: this.enableInlineTypes,
                  generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes
              });
    }
}

function isTypeStringLike(type: TypeReference): boolean {
    if (type.type !== "primitive") {
        return false;
    }
    return PrimitiveTypeV1._visit(type.primitive.v1, {
        integer: () => false,
        double: () => false,
        uint: () => false,
        uint64: () => false,
        float: () => false,
        string: () => true,
        boolean: () => false,
        long: () => false,
        dateTime: () => false,
        uuid: () => true,
        date: () => true,
        base64: () => true,
        bigInteger: () => true,
        _other: () => false
    });
}
