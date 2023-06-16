import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    Type,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { Reference } from "@fern-typescript/commons";
import {
    GeneratedAliasTypeSchema,
    GeneratedEnumTypeSchema,
    GeneratedObjectTypeSchema,
    GeneratedType,
    GeneratedTypeSchema,
    GeneratedUnionTypeSchema,
    ModelContext,
} from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedAliasTypeSchemaImpl } from "./alias/GeneratedAliasTypeSchemaImpl";
import { GeneratedEnumTypeSchemaImpl } from "./enum/GeneratedEnumTypeSchemaImpl";
import { GeneratedObjectTypeSchemaImpl } from "./object/GeneratedObjectTypeSchemaImpl";
import { GeneratedUndiscriminatedUnionTypeSchemaImpl } from "./undiscriminated-union/GeneratedUndiscriminatedUnionTypeSchemaImpl";
import { GeneratedUnionTypeSchemaImpl } from "./union/GeneratedUnionTypeSchemaImpl";

export declare namespace TypeSchemaGenerator {
    export interface Init {
        includeUtilsOnUnionMembers: boolean;
    }

    export namespace generateTypeSchema {
        export interface Args<Context> {
            typeName: string;
            shape: Type;
            getGeneratedType: () => GeneratedType<Context>;
            getReferenceToGeneratedType: () => ts.TypeNode;
            getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
        }
    }
}

export class TypeSchemaGenerator<Context extends ModelContext = ModelContext> {
    private includeUtilsOnUnionMembers: boolean;

    constructor({ includeUtilsOnUnionMembers }: TypeSchemaGenerator.Init) {
        this.includeUtilsOnUnionMembers = includeUtilsOnUnionMembers;
    }

    public generateTypeSchema({
        shape,
        typeName,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
    }: TypeSchemaGenerator.generateTypeSchema.Args<Context>): GeneratedTypeSchema<Context> {
        return Type._visit<GeneratedTypeSchema<Context>>(shape, {
            union: (shape) =>
                this.generateUnion({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema,
                }),
            undiscriminatedUnion: (shape) =>
                this.generateUndiscriminatedUnion({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema,
                }),
            object: (shape) =>
                this.generateObject({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema,
                }),
            enum: (shape) =>
                this.generateEnum({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema,
                }),
            alias: (shape) =>
                this.generateAlias({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema,
                }),
            _unknown: () => {
                throw new Error("Unknown type declaration shape: " + shape._type);
            },
        });
    }

    private generateUnion({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
    }: {
        typeName: string;
        shape: UnionTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => ts.TypeNode;
        getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
    }): GeneratedUnionTypeSchema<Context> {
        return new GeneratedUnionTypeSchemaImpl({
            typeName,
            shape,
            getGeneratedType,
            getReferenceToGeneratedType,
            getReferenceToGeneratedTypeSchema,
            includeUtilsOnUnionMembers: this.includeUtilsOnUnionMembers,
        });
    }

    private generateObject({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
    }: {
        typeName: string;
        shape: ObjectTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => ts.TypeNode;
        getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
    }): GeneratedObjectTypeSchema<Context> {
        return new GeneratedObjectTypeSchemaImpl({
            typeName,
            shape,
            getGeneratedType,
            getReferenceToGeneratedType,
            getReferenceToGeneratedTypeSchema,
        });
    }

    private generateEnum({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
    }: {
        typeName: string;
        shape: EnumTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => ts.TypeNode;
        getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
    }): GeneratedEnumTypeSchema<Context> {
        return new GeneratedEnumTypeSchemaImpl({
            typeName,
            shape,
            getGeneratedType,
            getReferenceToGeneratedType,
            getReferenceToGeneratedTypeSchema,
        });
    }

    private generateAlias({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
    }: {
        typeName: string;
        shape: AliasTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => ts.TypeNode;
        getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
    }): GeneratedAliasTypeSchema<Context> {
        return new GeneratedAliasTypeSchemaImpl({
            typeName,
            shape,
            getGeneratedType,
            getReferenceToGeneratedType,
            getReferenceToGeneratedTypeSchema,
        });
    }

    private generateUndiscriminatedUnion({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema,
    }: {
        typeName: string;
        shape: UndiscriminatedUnionTypeDeclaration;
        getGeneratedType: () => GeneratedType<Context>;
        getReferenceToGeneratedType: () => ts.TypeNode;
        getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
    }): GeneratedUndiscriminatedUnionTypeSchemaImpl<Context> {
        return new GeneratedUndiscriminatedUnionTypeSchemaImpl({
            typeName,
            shape,
            getGeneratedType,
            getReferenceToGeneratedType,
            getReferenceToGeneratedTypeSchema,
        });
    }
}
