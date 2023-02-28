import { FernFilepath } from "@fern-fern/ir-model/commons";
import {
    EnumTypeDeclaration,
    ExampleType,
    ObjectTypeDeclaration,
    PrimitiveType,
    Type,
    TypeReference,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { Reference } from "@fern-typescript/commons";
import {
    GeneratedAliasType,
    GeneratedEnumType,
    GeneratedObjectType,
    GeneratedType,
    GeneratedUnionType,
    TypeContext,
} from "@fern-typescript/contexts";
import { GeneratedAliasTypeImpl } from "./alias/GeneratedAliasTypeImpl";
import { GeneratedBrandedStringAliasImpl } from "./alias/GeneratedBrandedStringAliasImpl";
import { GeneratedEnumTypeImpl } from "./enum/GeneratedEnumTypeImpl";
import { GeneratedObjectTypeImpl } from "./object/GeneratedObjectTypeImpl";
import { GeneratedUnionTypeImpl } from "./union/GeneratedUnionTypeImpl";

export declare namespace TypeGenerator {
    export interface Init {
        useBrandedStringAliases: boolean;
    }

    export namespace generateType {
        export interface Args<Context> {
            typeName: string;
            shape: Type;
            examples: ExampleType[];
            docs: string | undefined;
            fernFilepath: FernFilepath;
            getReferenceToSelf: (context: Context) => Reference;
        }
    }
}

export class TypeGenerator<Context extends TypeContext = TypeContext> {
    private useBrandedStringAliases: boolean;

    constructor({ useBrandedStringAliases }: TypeGenerator.Init) {
        this.useBrandedStringAliases = useBrandedStringAliases;
    }

    public generateType({
        shape,
        examples,
        typeName,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: TypeGenerator.generateType.Args<Context>): GeneratedType<Context> {
        return Type._visit<GeneratedType<Context>>(shape, {
            union: (shape) => this.generateUnion({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf }),
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
                    getReferenceToSelf,
                }),
            _unknown: () => {
                throw new Error("Unknown type declaration shape: " + shape._type);
            },
        });
    }

    private generateUnion({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: UnionTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedUnionType<Context> {
        return new GeneratedUnionTypeImpl({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf });
    }

    private generateObject({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: ObjectTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedObjectType<Context> {
        return new GeneratedObjectTypeImpl({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf });
    }

    private generateEnum({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: EnumTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepath;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedEnumType<Context> {
        return new GeneratedEnumTypeImpl({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf });
    }

    public generateAlias({
        typeName,
        aliasOf,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf,
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
              })
            : new GeneratedAliasTypeImpl({
                  typeName,
                  shape: aliasOf,
                  examples,
                  docs,
                  fernFilepath,
                  getReferenceToSelf,
              });
    }
}

function isTypeStringLike(type: TypeReference): boolean {
    if (type._type !== "primitive") {
        return false;
    }
    return PrimitiveType._visit(type.primitive, {
        integer: () => false,
        double: () => false,
        string: () => true,
        boolean: () => false,
        long: () => false,
        dateTime: () => false,
        uuid: () => true,
        _unknown: () => false,
    });
}
