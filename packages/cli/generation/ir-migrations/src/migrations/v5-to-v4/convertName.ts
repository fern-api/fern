import { IrVersions } from "../../ir-versions";

export function convertNameToV1(name: IrVersions.V5.commons.Name): IrVersions.V4.commons.StringWithAllCasings {
    return {
        originalValue: name.originalName,
        camelCase: name.camelCase.unsafeName,
        pascalCase: name.pascalCase.unsafeName,
        snakeCase: name.snakeCase.unsafeName,
        screamingSnakeCase: name.screamingSnakeCase.unsafeName
    };
}

export function convertNameAndWireValueToV1(
    name: IrVersions.V5.commons.NameAndWireValue
): IrVersions.V4.commons.WireStringWithAllCasings {
    return {
        ...convertNameToV1(name.name),
        wireValue: name.wireValue
    };
}

export function convertNameToV2(name: IrVersions.V5.commons.Name): IrVersions.V4.commons.Name {
    return {
        safeName: {
            originalValue: name.originalName,
            camelCase: name.camelCase.safeName,
            pascalCase: name.pascalCase.safeName,
            snakeCase: name.snakeCase.safeName,
            screamingSnakeCase: name.screamingSnakeCase.safeName
        },
        unsafeName: {
            originalValue: name.originalName,
            camelCase: name.camelCase.unsafeName,
            pascalCase: name.pascalCase.unsafeName,
            snakeCase: name.snakeCase.unsafeName,
            screamingSnakeCase: name.screamingSnakeCase.unsafeName
        }
    };
}

export function convertNameAndWireValueToV2(
    name: IrVersions.V5.commons.NameAndWireValue
): IrVersions.V4.commons.NameAndWireValue {
    return {
        wireValue: name.wireValue,
        name: convertNameToV2(name.name)
    };
}
