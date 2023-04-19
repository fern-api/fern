import { FileProperty } from "@fern-fern/ir-model/http";

export function getParameterNameForFile(file: FileProperty): string {
    return file.key.name.camelCase.unsafeName;
}
