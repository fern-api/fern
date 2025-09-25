import { camelCase, snakeCase, upperFirst } from "lodash-es";

// Redefining some IR types to avoid a dependency on @fern-api/ir-sdk
type SafeAndUnsafeString = {
    unsafeName: string;
    safeName: string;
};
type CasedName = {
    originalName: string;
    camelCase: SafeAndUnsafeString | undefined;
    pascalCase: SafeAndUnsafeString | undefined;
    snakeCase: SafeAndUnsafeString | undefined;
    screamingSnakeCase: SafeAndUnsafeString | undefined;
};
type Name = string | CasedName;
type NameAndWireValue = {
    wireValue: string;
    name: Name;
};

// The fully expanded name type, like the old version of the IR type
export type ExpandedName = {
    originalName: string;
    camelCase: SafeAndUnsafeString;
    pascalCase: SafeAndUnsafeString;
    snakeCase: SafeAndUnsafeString;
    screamingSnakeCase: SafeAndUnsafeString;
};

export type ExpandedNameAndWireValue = {
    wireValue: string;
    name: ExpandedName;
};

export const expandNameAndWireValue = (nameAndWireValue: NameAndWireValue): ExpandedNameAndWireValue => {
    return {
        ...nameAndWireValue,
        name: expandName(nameAndWireValue.name)
    };
};

export const expandName = (name: Name): ExpandedName => {
    const originalName = getOriginalName(name);
    const camelCaseName = camelCase(originalName);
    const pascalCaseName = upperFirst(camelCaseName);
    const snakeCaseName = snakeCase(originalName);
    const screamingSnakeCaseName = snakeCaseName.toUpperCase();

    if (typeof name !== "string") {
        const { camelCase, pascalCase, snakeCase, screamingSnakeCase } = name;
        return {
            originalName,
            camelCase: camelCase ?? {
                unsafeName: camelCaseName,
                safeName: camelCaseName
            },
            pascalCase: pascalCase ?? {
                unsafeName: pascalCaseName,
                safeName: pascalCaseName
            },
            snakeCase: snakeCase ?? {
                unsafeName: snakeCaseName,
                safeName: snakeCaseName
            },
            screamingSnakeCase: screamingSnakeCase ?? {
                unsafeName: screamingSnakeCaseName,
                safeName: screamingSnakeCaseName
            }
        };
    }

    return {
        originalName,
        camelCase: {
            unsafeName: camelCaseName,
            safeName: camelCaseName
        },
        pascalCase: {
            unsafeName: pascalCaseName,
            safeName: pascalCaseName
        },
        snakeCase: {
            unsafeName: snakeCaseName,
            safeName: snakeCaseName
        },
        screamingSnakeCase: {
            unsafeName: screamingSnakeCaseName,
            safeName: screamingSnakeCaseName
        }
    };
};

export const getOriginalName = (name: Name) => {
    if (typeof name === "string") {
        return name;
    }
    return name.originalName;
};
