import { NameAndWireValueOrString, NameOrString } from "@fern-api/ir-sdk";
import camelCase from "lodash-es/camelCase";

export function getOriginalName(name: NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

export function getWireValue(nameAndWireValue: NameAndWireValueOrString): string {
    return typeof nameAndWireValue === "string" ? nameAndWireValue : nameAndWireValue.wireValue;
}

export function getCamelCaseUnsafe(name: NameOrString): string {
    if (typeof name === "string") {
        return camelCase(name);
    }
    return name.camelCase.unsafeName;
}

export function getPascalCaseUnsafe(name: NameOrString): string {
    if (typeof name === "string") {
        const camel = camelCase(name);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    }
    return name.pascalCase.unsafeName;
}

export function getInnerNamePascalCaseUnsafe(nameAndWireValue: NameAndWireValueOrString): string {
    if (typeof nameAndWireValue === "string") {
        const camel = camelCase(nameAndWireValue);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    }
    return getPascalCaseUnsafe(nameAndWireValue.name);
}
