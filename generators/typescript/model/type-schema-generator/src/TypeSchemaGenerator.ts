import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { Reference } from "@fern-typescript/commons";
import {
    GeneratedAliasTypeSchema,
    GeneratedEnumTypeSchema,
    GeneratedObjectTypeSchema,
    GeneratedType,
    GeneratedTypeSchema,
    GeneratedUnionTypeSchema,
    ModelContext
} from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { GeneratedAliasTypeSchemaImpl } from "./alias/GeneratedAliasTypeSchemaImpl.js";
import { GeneratedEnumTypeSchemaImpl } from "./enum/GeneratedEnumTypeSchemaImpl.js";
import { GeneratedObjectTypeSchemaImpl } from "./object/GeneratedObjectTypeSchemaImpl.js";
import { GeneratedUndiscriminatedUnionTypeSchemaImpl } from "./undiscriminated-union/GeneratedUndiscriminatedUnionTypeSchemaImpl.js";
import { GeneratedUnionTypeSchemaImpl } from "./union/GeneratedUnionTypeSchemaImpl.js";

export declare namespace TypeSchemaGenerator {
    export interface Init {
        includeUtilsOnUnionMembers: boolean;
        noOptionalProperties: boolean;
        enableForwardCompatibleEnums: boolean;
        caseConverter: CaseConverter;
    }

    export namespace generateTypeSchema {
        export interface Args<Context> {
            typeName: string;
            shape: FernIr.Type;
            getGeneratedType: () => GeneratedType<Context>;
            getReferenceToGeneratedType: () => ts.TypeNode;
            getReferenceToGeneratedTypeSchema: (context: Context) => Reference;
        }
    }
}

export class TypeSchemaGenerator<Context extends ModelContext = ModelContext> {
    private includeUtilsOnUnionMembers: boolean;
    private noOptionalProperties: boolean;
    private enableForwardCompatibleEnums: boolean;
    private case: CaseConverter;

    constructor({
        includeUtilsOnUnionMembers,
        noOptionalProperties,
        enableForwardCompatibleEnums,
        caseConverter
    }: TypeSchemaGenerator.Init) {
        this.includeUtilsOnUnionMembers = includeUtilsOnUnionMembers;
        this.noOptionalProperties = noOptionalProperties;
        this.enableForwardCompatibleEnums = enableForwardCompatibleEnums;
        this.case = caseConverter;
    }

    public generateTypeSchema({
        shape,
        typeName,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema
    }: TypeSchemaGenerator.generateTypeSchema.Args<Context>): GeneratedTypeSchema<Context> {
        return FernIr.Type._visit<GeneratedTypeSchema<Context>>(shape, {
            union: (shape) =>
                this.generateUnion({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema
                }),
            undiscriminatedUnion: (shape) =>
                this.generateUndiscriminatedUnion({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema
                }),
            object: (shape) =>
                this.generateObject({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema
                }),
            enum: (shape) =>
                this.generateEnum({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema
                }),
            alias: (shape) =>
                this.generateAlias({
                    typeName,
                    shape,
                    getGeneratedType,
                    getReferenceToGeneratedType,
                    getReferenceToGeneratedTypeSchema
                }),
            _other: () => {
                throw new Error("Unknown type declaration shape: " + shape.type);
            }
        });
    }

    private generateUnion({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema
    }: {
        typeName: string;
        shape: FernIr.UnionTypeDeclaration;
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
            noOptionalProperties: this.noOptionalProperties,
            caseConverter: this.case
        });
    }

    private generateObject({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema
    }: {
        typeName: string;
        shape: FernIr.ObjectTypeDeclaration;
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
            noOptionalProperties: this.noOptionalProperties,
            caseConverter: this.case
        });
    }

    private generateEnum({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema
    }: {
        typeName: string;
        shape: FernIr.EnumTypeDeclaration;
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
            noOptionalProperties: this.noOptionalProperties,
            enableForwardCompatibleEnums: this.enableForwardCompatibleEnums,
            caseConverter: this.case
        });
    }

    private generateAlias({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema
    }: {
        typeName: string;
        shape: FernIr.AliasTypeDeclaration;
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
            noOptionalProperties: this.noOptionalProperties,
            caseConverter: this.case
        });
    }

    private generateUndiscriminatedUnion({
        typeName,
        shape,
        getGeneratedType,
        getReferenceToGeneratedType,
        getReferenceToGeneratedTypeSchema
    }: {
        typeName: string;
        shape: FernIr.UndiscriminatedUnionTypeDeclaration;
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
            noOptionalProperties: this.noOptionalProperties,
            caseConverter: this.case
        });
    }
}
