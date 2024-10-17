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
    GeneratedAliasType,
    GeneratedEnumType,
    GeneratedObjectType,
    GeneratedType,
    GeneratedUndiscriminatedUnionType,
    GeneratedUnionType,
    ModelContext
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
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
        retainOriginalCasing: boolean;
        respectInlinedTypes: boolean;
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
            respectInlinedTypes: boolean;
        }
    }
}

export class TypeGenerator<Context extends ModelContext = ModelContext> {
    private useBrandedStringAliases: boolean;
    private includeUtilsOnUnionMembers: boolean;

    constructor(private readonly init: TypeGenerator.Init) {
        this.useBrandedStringAliases = init.useBrandedStringAliases;
        this.includeUtilsOnUnionMembers = init.includeUtilsOnUnionMembers;
    }

    public generateType({
        shape,
        examples,
        typeName,
        docs,
        fernFilepath,
        getReferenceToSelf
    }: TypeGenerator.generateType.Args<Context>): GeneratedType<Context> {
        return Type._visit<GeneratedType<Context>>(shape, {
            union: (shape) => this.generateUnion({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf }),
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
            ...this.init
        });
    }

    private generateUnion({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf
    }: {
        typeName: string;
        shape: UnionTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedUnionType<Context> {
        return new GeneratedUnionTypeImpl({
            typeName,
            shape,
            examples,
            docs,
            fernFilepath,
            getReferenceToSelf,
            ...this.init
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
            ...this.init
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
            includeEnumUtils: this.includeUtilsOnUnionMembers,
            ...this.init
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
                  ...this.init
              })
            : new GeneratedAliasTypeImpl({
                  typeName,
                  shape: aliasOf,
                  examples,
                  docs,
                  fernFilepath,
                  getReferenceToSelf,
                  ...this.init
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
