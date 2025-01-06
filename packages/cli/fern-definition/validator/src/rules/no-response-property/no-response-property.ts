import { assertNever } from "@fern-api/core-utils";
import { RawSchemas, parseRawFileType, parseRawTextType } from "@fern-api/fern-definition-schema";
import {
    FernFileContext,
    ResolvedType,
    TypeResolver,
    TypeResolverImpl,
    constructFernFileContext
} from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const NoResponsePropertyRule: Rule = {
    name: "no-response-property",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }, { relativeFilepath, contents }) => {
                    const { response } = endpoint;
                    if (response == null) {
                        return [];
                    }
                    const responseType = typeof response === "string" ? response : response.type;
                    if (parseRawFileType(responseType) != null) {
                        return [];
                    } else if (parseRawTextType(responseType) != null) {
                        return [];
                    }
                    const responseProperty = typeof response !== "string" ? response.property : undefined;
                    if (responseProperty == null) {
                        return [];
                    }
                    const file = constructFernFileContext({
                        relativeFilepath,
                        definitionFile: contents,
                        rootApiFile: workspace.definition.rootApiFile.contents,
                        casingsGenerator: CASINGS_GENERATOR
                    });
                    const resolvedType = typeResolver.resolveTypeOrThrow({
                        type: typeof response !== "string" ? response.type : response,
                        file
                    });
                    const result = resolvedTypeHasProperty(resolvedType, responseProperty, file, typeResolver);
                    return resultToRuleViolations(result, responseProperty);
                }
            }
        };
    }
};

enum Result {
    ContainsProperty,
    DoesNotContainProperty,
    IsNotObject
}

function resultToRuleViolations(result: Result, responseProperty: string): RuleViolation[] {
    switch (result) {
        case Result.ContainsProperty:
            return [];
        case Result.DoesNotContainProperty:
            return [
                {
                    severity: "error",
                    message: `Response does not have a property named ${responseProperty}.`
                }
            ];
        case Result.IsNotObject:
            return [
                {
                    severity: "error",
                    message: "Response must be an object in order to return a property as a response."
                }
            ];
    }
}

function resolvedTypeHasProperty(
    resolvedType: ResolvedType,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Result {
    switch (resolvedType._type) {
        case "container":
            if (resolvedType.container._type !== "optional") {
                return Result.IsNotObject;
            }
            return resolvedTypeHasProperty(resolvedType.container.itemType, property, file, typeResolver);
        case "named":
            if (!isRawObjectDefinition(resolvedType.declaration)) {
                return Result.IsNotObject;
            }
            if (rawObjectSchemaHasProperty(resolvedType.declaration, property, file, typeResolver)) {
                return Result.ContainsProperty;
            }
            return Result.DoesNotContainProperty;
        case "primitive":
        case "unknown":
            return Result.IsNotObject;
        default:
            assertNever(resolvedType);
    }
}

function rawObjectSchemaHasProperty(
    objectSchema: RawSchemas.ObjectSchema,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): boolean {
    const properties = getAllPropertiesForRawObjectSchema(objectSchema, file, typeResolver);
    return properties.has(property);
}

function getAllPropertiesForRawObjectSchema(
    objectSchema: RawSchemas.ObjectSchema,
    file: FernFileContext,
    typeResolver: TypeResolver
): Set<string> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties = new Set<string>();
    for (const extendedType of extendedTypes) {
        for (const extendedProperty of getAllPropertiesForExtendedType(extendedType, file, typeResolver)) {
            properties.add(extendedProperty);
        }
    }

    for (const propertyKey of Object.keys(objectSchema.properties ?? {})) {
        properties.add(propertyKey);
    }

    return properties;
}

function getAllPropertiesForExtendedType(
    extendedType: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Set<string> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return getAllPropertiesForRawObjectSchema(resolvedType.declaration, file, typeResolver);
    }
    // Unreachable; extended types must be named objects. This should be handled
    // by another rule, so we just return an empty set.
    return new Set<string>();
}

type NamedDeclaration =
    | RawSchemas.ObjectSchema
    | RawSchemas.DiscriminatedUnionSchema
    | RawSchemas.UndiscriminatedUnionSchema
    | RawSchemas.EnumSchema;

function isRawObjectDefinition(namedDeclaration: NamedDeclaration): namedDeclaration is RawSchemas.ObjectSchema {
    return (
        (namedDeclaration as RawSchemas.ObjectSchema).extends != null ||
        (namedDeclaration as RawSchemas.ObjectSchema).properties != null
    );
}
