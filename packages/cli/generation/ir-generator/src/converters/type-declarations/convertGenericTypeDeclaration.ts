import { isRawObjectDefinition, parseGeneric, RawSchemas } from "@fern-api/fern-definition-schema";
import { Type } from "@fern-api/ir-sdk";
import { CliError } from "@fern-api/task-context";
import { FernFileContext } from "../../FernFileContext.js";
import { TypeResolver } from "../../resolvers/TypeResolver.js";
import { parseTypeName } from "../../utils/parseTypeName.js";
import { substituteGenericParams } from "../../utils/substituteGenericParams.js";
import { getExtensionsAsList, getObjectPropertiesFromRawObjectSchema } from "./convertObjectTypeDeclaration.js";

export function convertGenericTypeDeclaration({
    generic,
    file,
    typeResolver
}: {
    generic: string | RawSchemas.AliasSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Type {
    const genericInstantiation = typeof generic === "string" ? generic : generic.type;

    const maybeGeneric = parseGeneric(genericInstantiation);
    if (maybeGeneric == null) {
        throw new CliError({
            message: `Invalid generic type definition: ${genericInstantiation}`,
            code: CliError.Code.ValidationError
        });
    }

    const resolvedBaseGeneric = typeResolver.getDeclarationOfNamedTypeOrThrow({
        referenceToNamedType: genericInstantiation,
        file
    });

    if (maybeGeneric.arguments && isRawObjectDefinition(resolvedBaseGeneric.declaration)) {
        const genericArgumentDefinitions = parseGeneric(resolvedBaseGeneric.typeName)?.arguments ?? [];

        const newProperties = Object.entries(resolvedBaseGeneric.declaration.properties ?? {}).map(([key, value]) => {
            let maybeReplacedValue = value;
            if (typeof value === "string") {
                maybeReplacedValue = substituteGenericParams(value, genericArgumentDefinitions, maybeGeneric.arguments);
            } else if (typeof value === "object" && value != null && "type" in value) {
                maybeReplacedValue = {
                    ...value,
                    type: substituteGenericParams(value.type, genericArgumentDefinitions, maybeGeneric.arguments)
                };
            }
            return [key, maybeReplacedValue];
        });

        const newExtends = getExtensionsAsList(resolvedBaseGeneric.declaration.extends).map((extended) => {
            const substituted = substituteGenericParams(extended, genericArgumentDefinitions, maybeGeneric.arguments);
            return parseTypeName({ typeName: substituted, file });
        });

        return Type.object({
            extends: newExtends,
            properties: getObjectPropertiesFromRawObjectSchema({ properties: Object.fromEntries(newProperties) }, file),
            extraProperties: resolvedBaseGeneric.declaration["extra-properties"] ?? false,
            extendedProperties: undefined
        });
    }

    throw new CliError({
        message: `Generic type definition not supported: ${genericInstantiation}`,
        code: CliError.Code.ValidationError
    });
}
