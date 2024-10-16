import { RawContainerTypes } from "../RawContainerType";

export declare namespace ParseGeneric {
    interface Return {
        name: string;
        arguments: string[];
    }
}

export function parseGeneric(name: string): ParseGeneric.Return | undefined {
    const genericMatch = name.match(/([\w.]+)<([\w,\s]+)>/);

    if (
        genericMatch?.[0] != null &&
        genericMatch[1] != null &&
        genericMatch[2] != null &&
        !RawContainerTypes.has(genericMatch[1].trim())
    ) {
        return {
            name: genericMatch[1].trim(),
            arguments: genericMatch[2].split(",").map((arg) => arg.trim())
        };
    }

    return undefined;
}
