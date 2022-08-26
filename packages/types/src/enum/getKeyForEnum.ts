import { EnumValue } from "@fern-fern/ir-model/types";

export function getKeyForEnum({ name }: EnumValue): string {
    return name.pascalCase;
}
