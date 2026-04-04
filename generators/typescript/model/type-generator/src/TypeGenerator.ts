import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
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

import { GeneratedAliasTypeImpl } from "./alias/GeneratedAliasTypeImpl.js";
import { GeneratedBrandedStringAliasImpl } from "./alias/GeneratedBrandedStringAliasImpl.js";
import { GeneratedEnumTypeImpl } from "./enum/GeneratedEnumTypeImpl.js";
import { GeneratedObjectTypeImpl } from "./object/GeneratedObjectTypeImpl.js";
import { GeneratedUndiscriminatedUnionTypeImpl } from "./undiscriminated-union/GeneratedUndiscriminatedUnionTypeImpl.js";
import { GeneratedUnionTypeImpl } from "./union/GeneratedUnionTypeImpl.js";

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
        caseConverter: CaseConverter;
    }

    export namespace generateType {
        export interface Args<Context> {
            typeName: string;
            shape: FernIr.Type;
            examples: FernIr.ExampleType[];
            docs: string | undefined;
            fernFilepath: FernIr.FernFilepath;
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
    private readonly case: CaseConverter;

    constructor({
        useBrandedStringAliases,
        includeUtilsOnUnionMembers,
        includeOtherInUnionTypes,
        enableForwardCompatibleEnums,
        includeSerdeLayer,
        noOptionalProperties,
        retainOriginalCasing,
        enableInlineTypes,
        generateReadWriteOnlyTypes,
        caseConverter
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
        this.case = caseConverter;
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
        return FernIr.Type._visit<GeneratedType<Context>>(shape, {
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
        shape: FernIr.UndiscriminatedUnionTypeDeclaration;
        examples: FernIr.ExampleType[];
        docs: string | undefined;
        fernFilepath: FernIr.FernFilepath;
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
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes,
            caseConverter: this.case
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
        shape: FernIr.UnionTypeDeclaration;
        examples: FernIr.ExampleType[];
        docs: string | undefined;
        fernFilepath: FernIr.FernFilepath;
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
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes,
            caseConverter: this.case
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
        shape: FernIr.ObjectTypeDeclaration;
        examples: FernIr.ExampleType[];
        docs: string | undefined;
        fernFilepath: FernIr.FernFilepath;
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
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes,
            caseConverter: this.case
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
        shape: FernIr.EnumTypeDeclaration;
        examples: FernIr.ExampleType[];
        docs: string | undefined;
        fernFilepath: FernIr.FernFilepath;
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
            generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes,
            caseConverter: this.case
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
        aliasOf: FernIr.TypeReference;
        examples: FernIr.ExampleType[];
        docs: string | undefined;
        fernFilepath: FernIr.FernFilepath;
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
                  generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes,
                  caseConverter: this.case
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
                  generateReadWriteOnlyTypes: this.generateReadWriteOnlyTypes,
                  caseConverter: this.case
              });
    }
}

function isTypeStringLike(type: FernIr.TypeReference): boolean {
    if (type.type !== "primitive") {
        return false;
    }
    return FernIr.PrimitiveTypeV1._visit(type.primitive.v1, {
        integer: () => false,
        double: () => false,
        uint: () => false,
        uint64: () => false,
        float: () => false,
        string: () => true,
        boolean: () => false,
        long: () => false,
        dateTime: () => false,
        dateTimeRfc2822: () => false,
        uuid: () => true,
        date: () => true,
        base64: () => true,
        bigInteger: () => true,
        _other: () => false
    });
}
