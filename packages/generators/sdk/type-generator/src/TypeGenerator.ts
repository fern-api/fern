import { FernFilepathV2 } from "@fern-fern/ir-model/commons";
import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ExampleType,
    ObjectTypeDeclaration,
    PrimitiveType,
    Type,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import {
    GeneratedAliasType,
    GeneratedEnumType,
    GeneratedObjectType,
    GeneratedType,
    GeneratedUnionType,
    Reference,
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
            fernFilepath: FernFilepathV2;
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
            alias: (shape) => this.generateAlias({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf }),
            _unknown: () => {
                throw new Error("Unknown type declaration shape: " + shape._type);
            },
        });
    }

    public generateUnion({
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
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedUnionType<Context> {
        return new GeneratedUnionTypeImpl({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf });
    }

    public generateObject({
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
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedObjectType<Context> {
        return new GeneratedObjectTypeImpl({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf });
    }

    public generateEnum({
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
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedEnumType<Context> {
        return new GeneratedEnumTypeImpl({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf });
    }

    public generateAlias({
        typeName,
        shape,
        examples,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: AliasTypeDeclaration;
        examples: ExampleType[];
        docs: string | undefined;
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedAliasType<Context> {
        return this.useBrandedStringAliases &&
            shape.aliasOf._type === "primitive" &&
            shape.aliasOf.primitive === PrimitiveType.String
            ? new GeneratedBrandedStringAliasImpl({
                  typeName,
                  shape,
                  examples,
                  docs,
                  fernFilepath,
                  getReferenceToSelf,
              })
            : new GeneratedAliasTypeImpl({ typeName, shape, examples, docs, fernFilepath, getReferenceToSelf });
    }
}
