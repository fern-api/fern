import { DeconflictedName, Name } from "@fern-api/ir-sdk";
import { camelCase, snakeCase, upperFirst } from "lodash-es";

export const expandName = (name: Name): DeconflictedName => {
    if (typeof name !== "string") {
        return name;
    }

    const camelCaseName = camelCase(name);
    const pascalCaseName = upperFirst(camelCaseName);
    const snakeCaseName = snakeCase(name);
    const screamingSnakeCaseName = snakeCaseName.toUpperCase();

    return {
        originalName: name,
        camelCase: {
            unsafeName: camelCaseName,
            safeName: camelCaseName,
        },
        pascalCase: {
            unsafeName: pascalCaseName,
            safeName: pascalCaseName,
        },
        snakeCase: {
            unsafeName: snakeCaseName,
            safeName: snakeCaseName,
        },
        screamingSnakeCase: {
            unsafeName: screamingSnakeCaseName,
            safeName: screamingSnakeCaseName,
        },
    }
};

export const getOriginalName = (name: Name) => {
    if (typeof name === "string") {
        return name;
    }
    return name.originalName;
};
