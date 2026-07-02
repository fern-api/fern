import { FernIr } from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext } from "@fern-api/v3-importer-commons";

import { FernGlobalParametersExtension } from "../extensions/x-fern-global-parameters.js";

function convertDefaultToLiteral(defaultValue: unknown): FernIr.Literal | undefined {
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
    return globalParameters.map((param, index) => {
        const breadcrumbs = ["x-fern-global-parameters", `${index}`];
        const location = convertLocation(param.in, [...breadcrumbs, "in"], context);
        return {
            id: param.name,
            name: context.casingsGenerator.generateNameAndWireValue({
                name: param.name,
                wireValue: param.name
            }),
            location,
            target: resolveTarget(param),
            valueType: resolveValueType(param.type, param.optional),
            env: param.env,
            clientDefault: convertDefaultToLiteral(param.default),
            optional: param.optional,
            apply: convertApplyMode(param.apply, [...breadcrumbs, "apply"], context),
            docs: param.docs
        };
    });
}
