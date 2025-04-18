import { assertNever } from "@fern-api/core-utils";

import { AliasSchema, DiscriminatedUnionSchema, EnumSchema, ObjectSchema, TypeDeclarationSchema } from "../schemas";
import { UndiscriminatedUnionSchema } from "../schemas";

export interface RawTypeDeclarationVisitor<R> {
    alias: (schema: string | AliasSchema) => R;
    object: (schema: ObjectSchema) => R;
    discriminatedUnion: (schema: DiscriminatedUnionSchema) => R;
    undiscriminatedUnion: (schema: UndiscriminatedUnionSchema) => R;
    enum: (schema: EnumSchema) => R;
}

export function visitRawTypeDeclaration<R>(
    declaration: TypeDeclarationSchema,
    visitor: RawTypeDeclarationVisitor<R>
): R {
    if (isRawAliasDefinition(declaration)) {
        return visitor.alias(declaration);
    }
    if (isRawDiscriminatedUnionDefinition(declaration)) {
        return visitor.discriminatedUnion(declaration);
    }
    if (isRawObjectDefinition(declaration)) {
        return visitor.object(declaration);
    }
    if (isRawUndiscriminatedUnionDefinition(declaration)) {
        return visitor.undiscriminatedUnion(declaration);
    }
    if (isRawEnumDefinition(declaration)) {
        return visitor.enum(declaration);
    }
    assertNever(declaration);
}

export function isRawAliasDefinition(
    rawTypeDeclaration: TypeDeclarationSchema
): rawTypeDeclaration is string | AliasSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return typeof rawTypeDeclaration === "string" || (rawTypeDeclaration as AliasSchema).type != null;
}

export function isRawObjectDefinition(rawTypeDeclaration: TypeDeclarationSchema): rawTypeDeclaration is ObjectSchema {
    return (
        (rawTypeDeclaration as ObjectSchema).extends != null || (rawTypeDeclaration as ObjectSchema).properties != null
    );
}

export function isRawDiscriminatedUnionDefinition(
    rawTypeDeclaration: TypeDeclarationSchema
): rawTypeDeclaration is DiscriminatedUnionSchema {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (rawTypeDeclaration as DiscriminatedUnionSchema).union != null &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rawTypeDeclaration as any).discriminated == null
    );
}

export function isRawUndiscriminatedUnionDefinition(
    rawTypeDeclaration: TypeDeclarationSchema
): rawTypeDeclaration is UndiscriminatedUnionSchema {
    const undiscriminatedUnionSchema = rawTypeDeclaration as UndiscriminatedUnionSchema;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return undiscriminatedUnionSchema.union != null && undiscriminatedUnionSchema.discriminated != null;
}

export function isRawEnumDefinition(rawTypeDeclaration: TypeDeclarationSchema): rawTypeDeclaration is EnumSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawTypeDeclaration as EnumSchema).enum != null;
}
