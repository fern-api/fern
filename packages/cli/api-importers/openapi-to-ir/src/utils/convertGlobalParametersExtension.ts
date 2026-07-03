import { FernIr } from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext } from "@fern-api/v3-importer-commons";

import { FernGlobalParametersExtension } from "../extensions/x-fern-global-parameters.js";

function convertDefaultToLiteral(
    defaultValue: unknown,
    typeString: string | undefined,
    breadcrumbs: string[],
    context: AbstractConverterContext<object>
): FernIr.Literal | undefined {
    if (defaultValue == null) {
        return undefined;
    }

    if (typeof defaultValue === "boolean") {
        if (typeString != null && typeString !== "boolean") {
            context.errorCollector.collect({
                message: `Default value is a boolean but type is '${typeString}'; expected a ${typeString} value`,
                path: [...breadcrumbs, "default"]
            });
            return undefined;
        }
        return FernIr.Literal.boolean(defaultValue);
    }

    if (typeof defaultValue === "string") {
        if (typeString === "boolean") {
            context.errorCollector.collect({
                message: `Default value is a string but type is 'boolean'; expected a boolean value`,
                path: [...breadcrumbs, "default"]
            });
            return undefined;
        }
        if (typeString === "integer" || typeString === "double" || typeString === "number") {
            context.errorCollector.collect({
                message: `Default value is a string but type is '${typeString}'; expected a numeric value`,
                path: [...breadcrumbs, "default"]
            });
            return undefined;
        }
        return FernIr.Literal.string(defaultValue);
    }

    if (typeof defaultValue === "number") {
        if (typeString === "boolean") {
            context.errorCollector.collect({
                message: `Default value is a number but type is 'boolean'; expected a boolean value`,
                path: [...breadcrumbs, "default"]
            });
            return undefined;
        }
        if (typeString === "string") {
            context.errorCollector.collect({
                message: `Default value is a number but type is 'string'; expected a string value`,
                path: [...breadcrumbs, "default"]
            });
            return undefined;
        }
        if (typeString === "integer" && !Number.isInteger(defaultValue)) {
            context.errorCollector.collect({
                message: `Default value ${defaultValue} is not an integer`,
                path: [...breadcrumbs, "default"]
            });
            return undefined;
        }
        // The IR Literal union only has string/boolean variants. Numeric
        // defaults are stored as string literals; Phase-3 generators must
        // parse back to the numeric type indicated by valueType.
        return FernIr.Literal.string(String(defaultValue));
    }

    context.errorCollector.collect({
        message: `Default value has unsupported type '${typeof defaultValue}'; expected a string, number, or boolean`,
        path: [...breadcrumbs, "default"]
    });
    return undefined;
}

function convertLocation(
    location: string | undefined,
    breadcrumbs: string[],
    context: AbstractConverterContext<object>
): FernIr.GlobalParameterLocation {
    switch (location) {
        case undefined:
        case "body":
            return FernIr.GlobalParameterLocation.Body;
        case "query":
            return FernIr.GlobalParameterLocation.Query;
        case "header":
            return FernIr.GlobalParameterLocation.Header;
        case "path":
            return FernIr.GlobalParameterLocation.Path;
        default:
            context.errorCollector.collect({
                message: `Invalid global parameter location '${location}'; expected one of: body, query, header, path`,
                path: breadcrumbs
            });
            return FernIr.GlobalParameterLocation.Body;
    }
}

function convertApplyMode(
    apply: string | undefined,
    breadcrumbs: string[],
    context: AbstractConverterContext<object>
): FernIr.GlobalParameterApplyMode | undefined {
    switch (apply) {
        case undefined:
            return undefined;
        case "explicit":
            return FernIr.GlobalParameterApplyMode.Explicit;
        case "auto":
            return FernIr.GlobalParameterApplyMode.Auto;
        default:
            context.errorCollector.collect({
                message: `Invalid global parameter apply mode '${apply}'; expected one of: explicit, auto`,
                path: breadcrumbs
            });
            return undefined;
    }
}

function resolveValueType(typeString: string | undefined, isOptional: boolean | undefined): FernIr.TypeReference {
    const baseType = resolveBaseType(typeString);
    if (isOptional === true) {
        return FernIr.TypeReference.container(FernIr.ContainerType.optional(baseType));
    }
    return baseType;
}

function resolveBaseType(typeString: string | undefined): FernIr.TypeReference {
    switch (typeString) {
        case "boolean":
            return FernIr.TypeReference.primitive({
                v1: "BOOLEAN",
                v2: FernIr.PrimitiveTypeV2.boolean({
                    default: undefined
                })
            });
        case "integer":
            return FernIr.TypeReference.primitive({
                v1: "INTEGER",
                v2: FernIr.PrimitiveTypeV2.integer({
                    default: undefined,
                    validation: undefined
                })
            });
        case "double":
        case "number":
            return FernIr.TypeReference.primitive({
                v1: "DOUBLE",
                v2: FernIr.PrimitiveTypeV2.double({
                    default: undefined,
                    validation: undefined
                })
            });
        case undefined:
        case "string":
        default:
            return AbstractConverter.STRING;
    }
}

function resolveTarget(param: FernGlobalParametersExtension.GlobalParameterExtension): string {
    if (param.target != null) {
        return param.target;
    }
    return param.name;
}

export function convertGlobalParametersExtension({
    globalParameters,
    context
}: {
    globalParameters: FernGlobalParametersExtension.GlobalParameterExtension[];
    context: AbstractConverterContext<object>;
}): FernIr.GlobalParameter[] {
    // Validate id uniqueness — keep only the first occurrence of each name
    const firstOccurrence = new Map<string, number>();
    for (const [index, param] of globalParameters.entries()) {
        const existingIndex = firstOccurrence.get(param.name);
        if (existingIndex != null) {
            context.errorCollector.collect({
                message:
                    `Duplicate global parameter name '${param.name}' at index ${index} ` +
                    `(first seen at index ${existingIndex}). Each global parameter must ` +
                    `have a unique name.`,
                path: ["x-fern-global-parameters", `${index}`, "name"]
            });
        } else {
            firstOccurrence.set(param.name, index);
        }
    }

    return globalParameters
        .map((param, index) => ({ param, index }))
        .filter(({ param, index }) => firstOccurrence.get(param.name) === index)
        .map(({ param, index }) => {
            const breadcrumbs = ["x-fern-global-parameters", `${index}`];
            const location = convertLocation(param.in, [...breadcrumbs, "in"], context);
            const sdkName = param["parameter-name"] ?? param.name;
            return {
                id: param.name,
                name: context.casingsGenerator.generateNameAndWireValue({
                    name: sdkName,
                    wireValue: param.name
                }),
                location,
                target: resolveTarget(param),
                valueType: resolveValueType(param.type, param.optional),
                env: param.env,
                clientDefault: convertDefaultToLiteral(param.default, param.type, breadcrumbs, context),
                optional: param.optional,
                apply: convertApplyMode(param.apply, [...breadcrumbs, "apply"], context),
                docs: param.docs
            };
        });
}
