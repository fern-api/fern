import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    Type,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import {
    GeneratedAliasTypeSchema,
    GeneratedEnumTypeSchema,
    GeneratedObjectTypeSchema,
    GeneratedType,
    GeneratedTypeSchema,
    GeneratedUnionTypeSchema,
    Reference,
    TypeSchemaContext,
} from "@fern-typescript/sdk-declaration-handler";
import { GeneratedAliasTypeSchemaImpl } from "./alias/GeneratedAliasTypeSchemaImpl";
import { GeneratedEnumTypeSchemaImpl } from "./enum/GeneratedEnumTypeSchemaImpl";
import { GeneratedObjectTypeSchemaImpl } from "./object/GeneratedObjectTypeSchemaImpl";
import { GeneratedUnionTypeSchemaImpl } from "./union/GeneratedUnionTypeSchemaImpl";

export declare namespace TypeSchemaGenerator {
    export namespace generateTypeSchema {
        export interface Args<Context extends TypeSchemaContext = TypeSchemaContext> {
            typeName: string;
            shape: Type;
            getGeneratedType: () => GeneratedType<Context>;
            getReferenceToGeneratedType: () => Reference;
        }
    }
}

export class TypeSchemaGenerator<Context extends TypeSchemaContext = TypeSchemaContext> {
    public generateTypeSchema({
        shape,
        typeName,
        getGeneratedType,
        getReferenceToGeneratedType,
    }: TypeSchemaGenerator.generateTypeSchema.Args<Context>): GeneratedTypeSchema<Context> {
        return Type._visit<GeneratedTypeSchema<Context>>(shape, {
            union: (shape) => this.generateUnion({ typeName, shape, getGeneratedType, getReferenceToGeneratedType }),
            object: (shape) => this.generateObject({ typeName, shape, getGeneratedType, getReferenceToGeneratedType }),
            enum: (shape) => this.generateEnum({ typeName, shape, getGeneratedType, getReferenceToGeneratedType }),
            alias: (shape) => this.generateAlias({ typeName, shape, getGeneratedType, getReferenceToGeneratedType }),
            _unknown: () => {
                throw new Error("Unknown type declaration shape: " + shape._type);
            },
        });
    }

    public generateUnion({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
    }: {
        typeName: string;
        shape: UnionTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => Reference;
    }): GeneratedUnionTypeSchema<Context> {
        return new GeneratedUnionTypeSchemaImpl({
            typeName,
            shape,
            getGeneratedType,
            getReferenceToGeneratedType,
        });
    }

    public generateObject({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
    }: {
        typeName: string;
        shape: ObjectTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => Reference;
    }): GeneratedObjectTypeSchema<Context> {
        return new GeneratedObjectTypeSchemaImpl({ typeName, shape, getGeneratedType, getReferenceToGeneratedType });
    }

    public generateEnum({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
    }: {
        typeName: string;
        shape: EnumTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => Reference;
    }): GeneratedEnumTypeSchema<Context> {
        return new GeneratedEnumTypeSchemaImpl({ typeName, shape, getGeneratedType, getReferenceToGeneratedType });
    }

    public generateAlias({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
    }: {
        typeName: string;
        shape: AliasTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => Reference;
    }): GeneratedAliasTypeSchema<Context> {
        return new GeneratedAliasTypeSchemaImpl({ typeName, shape, getGeneratedType, getReferenceToGeneratedType });
    }
}
