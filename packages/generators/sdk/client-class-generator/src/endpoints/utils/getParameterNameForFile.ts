import { FileProperty } from "@fern-fern/ir-sdk/api";

export function getParameterNameForFile(file: FileProperty): string {
    return file.key.name.camelCase.unsafeName;
}
