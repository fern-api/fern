import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    Type,
    TypeDeclaration,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import {
    GeneratedAliasTypeSchema,
    GeneratedEnumTypeSchema,
    GeneratedObjectTypeSchema,
    GeneratedTypeSchema,
    GeneratedUnionTypeSchema,
} from "@fern-typescript/sdk-declaration-handler";
import { GeneratedAliasTypeSchemaImpl } from "./alias/GeneratedAliasTypeSchemaImpl";
import { GeneratedEnumTypeSchemaImpl } from "./enum/GeneratedEnumTypeSchemaImpl";
import { GeneratedObjectTypeSchemaImpl } from "./object/GeneratedObjectTypeSchemaImpl";
import { GeneratedUnionTypeSchemaImpl } from "./union/GeneratedUnionTypeSchemaImpl";

export declare namespace TypeSchemaGenerator {
    export namespace generateTypeSchema {
        export interface Args {
            typeName: string;
            typeDeclaration: TypeDeclaration;
        }
    }
}

export class TypeSchemaGenerator {
    public generateTypeSchema({
        typeDeclaration,
        typeName,
    }: TypeSchemaGenerator.generateTypeSchema.Args): GeneratedTypeSchema {
        return Type._visit<GeneratedTypeSchema>(typeDeclaration.shape, {
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
    }): GeneratedUnionTypeSchema {
        return new GeneratedUnionTypeSchemaImpl({
            typeDeclaration,
            typeName,
            shape,
        });
    }

    public generateObject({
        typeDeclaration,
        typeName,
        shape,
    }: {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: ObjectTypeDeclaration;
    }): GeneratedObjectTypeSchema {
        return new GeneratedObjectTypeSchemaImpl({ typeDeclaration, typeName, shape });
    }

    public generateEnum({
        typeDeclaration,
        typeName,
        shape,
    }: {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: EnumTypeDeclaration;
    }): GeneratedEnumTypeSchema {
        return new GeneratedEnumTypeSchemaImpl({ typeDeclaration, typeName, shape });
    }

    public generateAlias({
        typeDeclaration,
        typeName,
        shape,
    }: {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: AliasTypeDeclaration;
    }): GeneratedAliasTypeSchema {
        return new GeneratedAliasTypeSchemaImpl({ typeDeclaration, typeName, shape });
    }
}
