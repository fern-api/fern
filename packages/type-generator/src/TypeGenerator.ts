import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    Type,
    TypeDeclaration,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import {
    GeneratedAliasType,
    GeneratedEnumType,
    GeneratedObjectType,
    GeneratedType,
    GeneratedUnionType,
} from "@fern-typescript/sdk-declaration-handler";
import { GeneratedAliasTypeImpl } from "./alias/GeneratedAliasTypeImpl";
import { GeneratedBrandedAliasImpl } from "./alias/GeneratedBrandedAliasImpl";
import { GeneratedEnumTypeImpl } from "./enum/GeneratedEnumTypeImpl";
import { GeneratedObjectTypeImpl } from "./object/GeneratedObjectTypeImpl";
import { GeneratedUnionTypeImpl } from "./union/GeneratedUnionTypeImpl";

export declare namespace TypeGenerator {
    export interface Init {
        useBrandedStringAliases: boolean;
    }

    export namespace generateType {
        export interface Args {
            typeName: string;
            typeDeclaration: TypeDeclaration;
        }
    }
}

export class TypeGenerator {
    private useBrandedStringAliases: boolean;

    constructor({ useBrandedStringAliases }: TypeGenerator.Init) {
        this.useBrandedStringAliases = useBrandedStringAliases;
    }

    public generateType({ typeDeclaration, typeName }: TypeGenerator.generateType.Args): GeneratedType {
        return Type._visit<GeneratedType>(typeDeclaration.shape, {
            union: (shape) => this.generateUnion({ typeDeclaration, typeName, shape }),
            object: (shape) => this.generateObject({ typeDeclaration, typeName, shape }),
            enum: (shape) => this.generateEnum({ typeDeclaration, typeName, shape }),
            alias: (shape) => this.generateAlias({ typeDeclaration, typeName, shape }),
            _unknown: () => {
                throw new Error("Unknown type declaration shape: " + typeDeclaration.shape._type);
            },
        });
    }

    public generateUnion({
        typeDeclaration,
        typeName,
        shape,
    }: {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: UnionTypeDeclaration;
    }): GeneratedUnionType {
        return new GeneratedUnionTypeImpl({ typeDeclaration, typeName, shape });
    }

    public generateObject({
        typeDeclaration,
        typeName,
        shape,
    }: {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: ObjectTypeDeclaration;
    }): GeneratedObjectType {
        return new GeneratedObjectTypeImpl({ typeDeclaration, typeName, shape });
    }

    public generateEnum({
        typeDeclaration,
        typeName,
        shape,
    }: {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: EnumTypeDeclaration;
    }): GeneratedEnumType {
        return new GeneratedEnumTypeImpl({ typeDeclaration, typeName, shape });
    }

    public generateAlias({
        typeDeclaration,
        typeName,
        shape,
    }: {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: AliasTypeDeclaration;
    }): GeneratedAliasType {
        return this.useBrandedStringAliases
            ? new GeneratedBrandedAliasImpl({ typeDeclaration, typeName, shape })
            : new GeneratedAliasTypeImpl({ typeDeclaration, typeName, shape });
    }
}
