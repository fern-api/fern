import { FernFilepathV2 } from "@fern-fern/ir-model/commons";
import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
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
} from "@fern-typescript/sdk-declaration-handler";
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
        typeName,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: TypeGenerator.generateType.Args<Context>): GeneratedType<Context> {
        return Type._visit<GeneratedType<Context>>(shape, {
            union: (shape) => this.generateUnion({ typeName, shape, docs, fernFilepath, getReferenceToSelf }),
            object: (shape) => this.generateObject({ typeName, shape, docs, fernFilepath, getReferenceToSelf }),
            enum: (shape) => this.generateEnum({ typeName, shape, docs, fernFilepath, getReferenceToSelf }),
            alias: (shape) => this.generateAlias({ typeName, shape, docs, fernFilepath, getReferenceToSelf }),
            _unknown: () => {
                throw new Error("Unknown type declaration shape: " + shape._type);
            },
        });
    }

    public generateUnion({
        typeName,
        shape,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: UnionTypeDeclaration;
        docs: string | undefined;
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedUnionType<Context> {
        return new GeneratedUnionTypeImpl({ typeName, shape, docs, fernFilepath, getReferenceToSelf });
    }

    public generateObject({
        typeName,
        shape,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: ObjectTypeDeclaration;
        docs: string | undefined;
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedObjectType<Context> {
        return new GeneratedObjectTypeImpl({ typeName, shape, docs, fernFilepath, getReferenceToSelf });
    }

    public generateEnum({
        typeName,
        shape,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: EnumTypeDeclaration;
        docs: string | undefined;
        fernFilepath: FernFilepathV2;
        getReferenceToSelf: (context: Context) => Reference;
    }): GeneratedEnumType<Context> {
        return new GeneratedEnumTypeImpl({ typeName, shape, docs, fernFilepath, getReferenceToSelf });
    }

    public generateAlias({
        typeName,
        shape,
        docs,
        fernFilepath,
        getReferenceToSelf,
    }: {
        typeName: string;
        shape: AliasTypeDeclaration;
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
                  docs,
                  fernFilepath,
                  getReferenceToSelf,
              })
            : new GeneratedAliasTypeImpl({ typeName, shape, docs, fernFilepath, getReferenceToSelf });
    }
}
