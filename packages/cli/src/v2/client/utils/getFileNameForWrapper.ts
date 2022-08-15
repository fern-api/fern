import { WrapperName } from "@fern-typescript/commons-v2";

export function getFileNameForWrapper(wrapperName: WrapperName): string {
    return `${wrapperName.name}.ts`;
}
