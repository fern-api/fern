import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernIr } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext.js";

function convertLocation(location: string | undefined): FernIr.GlobalParameterLocation {
    switch (location) {
        case "header":
            return FernIr.GlobalParameterLocation.Header;
        case "query":
            return FernIr.GlobalParameterLocation.Query;
        case "path":
            return FernIr.GlobalParameterLocation.Path;
        case "body":
        case undefined:
        default:
            return FernIr.GlobalParameterLocation.Body;
    }
}

function convertApplyMode(apply: string | undefined): FernIr.GlobalParameterApplyMode | undefined {
    switch (apply) {
        case "explicit":
            return FernIr.GlobalParameterApplyMode.Explicit;
        case "auto":
            return FernIr.GlobalParameterApplyMode.Auto;
        case "always":
            return FernIr.GlobalParameterApplyMode.Always;
        case undefined:
            return undefined;
        default:
            return undefined;
    }
}

function convertValueType(typeString: string | undefined, isOptional: boolean | undefined): FernIr.TypeReference {
    const baseType = convertBaseType(typeString);
    if (isOptional === true) {
        return FernIr.TypeReference.container(FernIr.ContainerType.optional(baseType));
    }
    return baseType;
}

function convertBaseType(typeString: string | undefined): FernIr.TypeReference {
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
        case "string":
        case undefined:
        default:
            return FernIr.TypeReference.primitive({
                v1: "STRING",
                v2: FernIr.PrimitiveTypeV2.string({
                    default: undefined,
                    validation: undefined
                })
            });
    }
}

function convertDefaultToLiteral(defaultValue: unknown, typeString: string | undefined): FernIr.Literal | undefined {
    if (defaultValue == null) {
        return undefined;
    }
    if (typeof defaultValue === "boolean") {
        if (typeString != null && typeString !== "boolean") {
            return undefined;
        }
        return FernIr.Literal.boolean(defaultValue);
    }
    if (typeof defaultValue === "string") {
        if (
            typeString === "boolean" ||
            typeString === "integer" ||
            typeString === "double" ||
            typeString === "number"
        ) {
            return undefined;
        }
        return FernIr.Literal.string(defaultValue);
    }
    if (typeof defaultValue === "number") {
        if (typeString === "boolean" || typeString === "string") {
            return undefined;
        }
        if (typeString === "integer" && !Number.isInteger(defaultValue)) {
            return undefined;
        }
        return FernIr.Literal.string(String(defaultValue));
    }
    return undefined;
}

export function convertGlobalParameters({
    globalParameters,
    file
}: {
    globalParameters: Record<string, RawSchemas.GlobalParameterDeclarationSchema>;
    file: FernFileContext;
}): FernIr.GlobalParameter[] {
    return Object.entries(globalParameters).map(([key, param]) => {
        const sdkName = param["parameter-name"] ?? key;
        return {
            id: key,
            name: file.casingsGenerator.generateNameAndWireValue({
                name: sdkName,
                wireValue: key
            }),
            location: convertLocation(param.in),
            target: param.target ?? key,
            valueType: convertValueType(param.type, param.optional),
            env: param.env,
            clientDefault: convertDefaultToLiteral(param.default, param.type),
            optional: param.optional,
            apply: convertApplyMode(param.apply),
            docs: param.docs
        };
    });
}
