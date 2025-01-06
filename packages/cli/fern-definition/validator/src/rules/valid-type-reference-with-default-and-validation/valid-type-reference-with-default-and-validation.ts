import { RawSchemas, isRawEnumDefinition } from "@fern-api/fern-definition-schema";
import { ResolvedType, TypeResolverImpl, constructFernFileContext } from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const ValidTypeReferenceWithDefaultAndValidationRule: Rule = {
    name: "valid-type-reference-with-default-and-validation",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                typeDeclaration: ({ declaration }) => {
                    if (!isRawEnumDefinition(declaration)) {
                        return [];
                    }
                    const enumValues = new Set<string>(
                        declaration.enum.map((enumValue) =>
                            typeof enumValue === "string" ? enumValue : enumValue.value
                        )
                    );
                    if (declaration.default != null && !enumValues.has(declaration.default)) {
                        return [
                            {
                                message: `Default value '${declaration.default}' is not a valid enum value`,
                                severity: "error"
                            }
                        ];
                    }
                    return [];
                },
                typeReference: (
                    { typeReference, _default, validation, location },
                    { relativeFilepath, contents: definitionFile }
                ) => {
                    const file = constructFernFileContext({
                        relativeFilepath,
                        definitionFile,
                        casingsGenerator: CASINGS_GENERATOR,
                        rootApiFile: workspace.definition.rootApiFile.contents
                    });

                    const resolvedType = typeResolver.resolveType({
                        type: typeReference,
                        file
                    });

                    if (resolvedType == null) {
                        // This error is caught by another rule.
                        return [];
                    }

                    return validateResolvedType({
                        resolvedType,
                        _default,
                        validation
                    });
                }
            }
        };
    }
};

function validateResolvedType({
    resolvedType,
    _default,
    validation
}: {
    resolvedType: ResolvedType;
    _default: unknown | undefined;
    validation: RawSchemas.ValidationSchema | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (_default == null && validation == null) {
        return [];
    }

    if (resolvedType._type === "container" && resolvedType.container._type === "optional") {
        return validateResolvedType({
            resolvedType: resolvedType.container.itemType,
            _default,
            validation
        });
    }

    let typeName: string = resolvedType._type;
    if (resolvedType._type === "primitive") {
        switch (resolvedType.primitive.v1) {
            case "STRING":
                return validateStringDefaultAndValidation({ _default, validation });
            case "DOUBLE":
                return validateDoubleDefaultAndValidation({ _default, validation });
            case "INTEGER":
                return validateIntegerDefaultAndValidation({ _default, validation });
            case "BOOLEAN":
                return validateBooleanDefaultAndValidation({ _default, validation });
            case "LONG":
                return validateLongDefaultAndValidation({ _default, validation });
            case "BIG_INTEGER":
                return validateBigIntegerDefaultAndValidation({ _default, validation });
            case "DATE_TIME":
                typeName = "datetime";
                break;
            case "UUID":
                typeName = "uuid";
                break;
            case "BASE_64":
                typeName = "base64";
                break;
            case "UINT":
                typeName = "uint";
                break;
            case "UINT_64":
                typeName = "uint64";
                break;
        }
    }

    if (resolvedType._type === "named" && isRawEnumDefinition(resolvedType.declaration)) {
        return validateEnumDefault({ declaration: resolvedType.declaration, _default });
    }

    if (_default != null) {
        violations.push({
            message: `Default values are not supported for the ${typeName} type`,
            severity: "error"
        });
    }

    if (validation != null) {
        violations.push({
            message: `Validation rules are not supported for the ${typeName} type`,
            severity: "error"
        });
    }

    return violations;
}

function validateEnumDefault({
    declaration,
    _default
}: {
    declaration: RawSchemas.EnumSchema;
    _default: unknown | undefined;
}): RuleViolation[] {
    if (_default == null) {
        return [];
    }

    const enumValues = new Set<string>(
        declaration.enum.map((enumValue) => (typeof enumValue === "string" ? enumValue : enumValue.value))
    );

    const violations: RuleViolation[] = [];
    if (!enumValues.has(_default as string)) {
        violations.push({
            message: `Default value '${_default as string}' is not a valid enum value`,
            severity: "error"
        });
    }

    return violations;
}

function validateStringDefaultAndValidation({
    _default,
    validation
}: {
    _default: unknown | undefined;
    validation: RawSchemas.ValidationSchema | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (_default != null && typeof _default !== "string") {
        violations.push({
            message: `Default value '${_default as string}' is not a valid string`,
            severity: "error"
        });
    }

    if (validation != null && !isRawStringValidation(validation)) {
        violations.push({
            message: `Validation rules '${JSON.stringify(validation)}' are not compatible with the string type`,
            severity: "error"
        });
    }

    return violations;
}

function validateDoubleDefaultAndValidation({
    _default,
    validation
}: {
    _default: unknown | undefined;
    validation: RawSchemas.ValidationSchema | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (_default != null && typeof _default !== "number") {
        violations.push({
            message: `Default value '${_default as string}' is not a valid double`,
            severity: "error"
        });
    }

    if (validation != null && !isRawNumberValidation(validation)) {
        violations.push({
            message: `Validation rules '${JSON.stringify(validation)}' are not compatible with the double type`,
            severity: "error"
        });
    }

    return violations;
}

function validateIntegerDefaultAndValidation({
    _default,
    validation
}: {
    _default: unknown | undefined;
    validation: RawSchemas.ValidationSchema | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (_default != null && !Number.isInteger(_default)) {
        violations.push({
            message: `Default value '${_default as string}' is not a valid integer`,
            severity: "error"
        });
    }

    if (validation != null) {
        if (!isRawNumberValidation(validation)) {
            violations.push({
                message: `Validation rules '${JSON.stringify(validation)}' are not compatible with the integer type`,
                severity: "error"
            });
        } else {
            violations.push(
                ...validateIntegerValidation({ name: "min", value: validation.min }),
                ...validateIntegerValidation({ name: "max", value: validation.max }),
                ...validateIntegerValidation({ name: "multipleOf", value: validation.multipleOf })
            );
        }
    }

    return violations;
}

function validateBooleanDefaultAndValidation({
    _default,
    validation
}: {
    _default: unknown | undefined;
    validation: RawSchemas.ValidationSchema | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (_default != null && typeof _default !== "boolean") {
        violations.push({
            message: `Default value '${_default as string}' is not a valid boolean`,
            severity: "error"
        });
    }

    if (validation != null) {
        violations.push({
            message: `Validation rules '${JSON.stringify(validation)}' are not compatible with the boolean type`,
            severity: "error"
        });
    }

    return violations;
}

function validateLongDefaultAndValidation({
    _default,
    validation
}: {
    _default: unknown | undefined;
    validation: RawSchemas.ValidationSchema | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (_default != null && typeof _default !== "number") {
        violations.push({
            message: `Default value '${_default as string}' is not a valid long`,
            severity: "error"
        });
    }

    if (validation != null) {
        violations.push({
            message: `Validation rules '${JSON.stringify(validation)}' are not compatible with the long type`,
            severity: "error"
        });
    }

    return violations;
}

function validateBigIntegerDefaultAndValidation({
    _default,
    validation
}: {
    _default: unknown | undefined;
    validation: RawSchemas.ValidationSchema | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (_default != null) {
        if (typeof _default !== "string") {
            violations.push({
                message: `Default value '${_default as string}' is not a valid bigint`,
                severity: "error"
            });
        } else {
            try {
                BigInt(_default as string);
            } catch (error) {
                violations.push({
                    message: `Default value '${_default as string}' is not a valid bigint`,
                    severity: "error"
                });
            }
        }
    }

    if (validation != null) {
        violations.push({
            message: `Validation rules '${JSON.stringify(validation)}' are not compatible with the bigint type`,
            severity: "error"
        });
    }

    return violations;
}

function validateIntegerValidation({ name, value }: { name: string; value: number | undefined }): RuleViolation[] {
    if (value != null && !Number.isInteger(value)) {
        return [
            {
                message: `Validation for '${name}' must be an integer, but found '${value}'`,
                severity: "error"
            }
        ];
    }
    return [];
}

function isRawNumberValidation(
    validation: RawSchemas.ValidationSchema
): validation is RawSchemas.NumberValidationSchema {
    const maybeNumberValidation = validation as RawSchemas.NumberValidationSchema;
    return (
        maybeNumberValidation.min != null ||
        maybeNumberValidation.max != null ||
        maybeNumberValidation.exclusiveMin != null ||
        maybeNumberValidation.exclusiveMax != null ||
        maybeNumberValidation.multipleOf != null
    );
}

function isRawStringValidation(
    validation: RawSchemas.ValidationSchema
): validation is RawSchemas.StringValidationSchema {
    const maybeStringValidation = validation as RawSchemas.StringValidationSchema;
    return (
        maybeStringValidation.minLength != null ||
        maybeStringValidation.maxLength != null ||
        maybeStringValidation.pattern != null ||
        maybeStringValidation.format != null
    );
}
