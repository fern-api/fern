import { FernIr } from "@fern-fern/ir-sdk";
import { camelCase, snakeCase, upperFirst } from "lodash-es";

export function fernIrNameFromString(name: string): FernIr.Name {
    // Convert to different cases
    const camelCaseName = camelCase(name);
    const snakeCaseName = snakeCase(name);
    const screamingSnakeCaseName = snakeCase(name).toUpperCase();
    const pascalCaseName = upperFirst(camelCase(name));

    return {
        originalName: name,
        camelCase: {
            safeName: camelCaseName,
            unsafeName: camelCaseName
        },
        snakeCase: {
            safeName: snakeCaseName,
            unsafeName: snakeCaseName
        },
        screamingSnakeCase: {
            safeName: screamingSnakeCaseName,
            unsafeName: screamingSnakeCaseName
        },
        pascalCase: {
            safeName: pascalCaseName,
            unsafeName: pascalCaseName
        }
    };
}
