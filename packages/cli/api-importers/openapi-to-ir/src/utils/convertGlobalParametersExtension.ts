import { FernIr } from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext } from "@fern-api/v3-importer-commons";

import { FernGlobalParametersExtension } from "../extensions/x-fern-global-parameters.js";

function resolveLocation(location: string | undefined): FernIr.GlobalParameterLocation {
    switch (location) {
        case "header":
            return FernIr.GlobalParameterLocation.Header;
        case "query":
            return FernIr.GlobalParameterLocation.Query;
        case "path":
            return FernIr.GlobalParameterLocation.Path;
        case "body":
        case undefined:
            return FernIr.GlobalParameterLocation.Body;
        default:
            return FernIr.GlobalParameterLocation.Body;
    }
}

function resolveApplyMode(apply: string | undefined): FernIr.GlobalParameterApplyMode {
    switch (apply) {
        case "auto":
            return FernIr.GlobalParameterApplyMode.Auto;
        case "explicit":
        case undefined:
            return FernIr.GlobalParameterApplyMode.Explicit;
        default:
            return FernIr.GlobalParameterApplyMode.Explicit;
    }
}

function resolveTypeReference(type: string | undefined, isOptional: boolean): FernIr.TypeReference {
    let baseType: FernIr.TypeReference;
    switch (type) {
        case "boolean":
            baseType = FernIr.TypeReference.primitive({
                v1: "BOOLEAN",
                v2: FernIr.PrimitiveTypeV2.boolean({
                    default: undefined
                })
            });
            break;
        case "integer":
            baseType = FernIr.TypeReference.primitive({
                v1: "INTEGER",
                v2: FernIr.PrimitiveTypeV2.integer({
                    default: undefined,
                    validation: undefined
                })
            });
            break;
        case "number":
        case "double":
            baseType = FernIr.TypeReference.primitive({
                v1: "DOUBLE",
                v2: FernIr.PrimitiveTypeV2.double({
                    default: undefined,
                    validation: undefined
                })
            });
            break;
        case "string":
        case undefined:
        default:
            baseType = AbstractConverter.STRING;
            break;
    }

    if (isOptional) {
        return FernIr.TypeReference.container(FernIr.ContainerType.optional(baseType));
    }
    return baseType;
}

function coerceDefaultToLiteral(
    defaultValue: string | boolean | number | undefined,
    context: AbstractConverterContext<object>,
    breadcrumbs: string[]
): FernIr.Literal | undefined {
    if (defaultValue == null) {
        return undefined;
    }
    if (typeof defaultValue === "string") {
        return FernIr.Literal.string(defaultValue);
    }
    if (typeof defaultValue === "boolean") {
        return FernIr.Literal.boolean(defaultValue);
    }
    if (typeof defaultValue === "number") {
        return FernIr.Literal.string(String(defaultValue));
    }
    context.errorCollector.collect({
        message: `Global parameter default value must be a scalar (string, boolean, number), got ${typeof defaultValue}`,
        path: breadcrumbs
    });
    return undefined;
}

export function convertGlobalParametersExtension({
    globalParameters,
    context
}: {
    globalParameters: FernGlobalParametersExtension.GlobalParameterExtension[];
    context: AbstractConverterContext<object>;
}): FernIr.GlobalParameter[] {
    return globalParameters.map((param) => {
        const isOptional = param.optional ?? false;
        const location = resolveLocation(param.in);
        const parameterName = param["parameter-name"] ?? param.name;

        return {
            name: context.casingsGenerator.generateNameAndWireValue({
                name: parameterName,
                wireValue: param.name
            }),
            location,
            target: location === FernIr.GlobalParameterLocation.Body ? (param.target ?? param.name) : undefined,
            valueType: resolveTypeReference(param.type, isOptional),
            optional: isOptional,
            env: param.env,
            apply: resolveApplyMode(param.apply),
            clientDefault: coerceDefaultToLiteral(param.default, context, ["x-fern-global-parameters", param.name]),
            availability: undefined,
            docs: undefined
        };
    });
}

export function convertGlobalHeadersToGlobalParameters({
    globalHeaders,
    context
}: {
    globalHeaders: FernIr.HttpHeader[];
    context: AbstractConverterContext<object>;
}): FernIr.GlobalParameter[] {
    return globalHeaders.map((header) => ({
        name: header.name,
        location: FernIr.GlobalParameterLocation.Header,
        target: undefined,
        valueType: header.valueType,
        optional: isOptionalType(header.valueType),
        env: header.env,
        apply: FernIr.GlobalParameterApplyMode.Auto,
        clientDefault: header.clientDefault,
        availability: header.availability,
        docs: header.docs
    }));
}

function isOptionalType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type === "container") {
        return typeRef.container.type === "optional";
    }
    return false;
}
