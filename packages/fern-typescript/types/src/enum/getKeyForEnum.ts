import { EnumValue } from "@fern-fern/ir-model";

export function getKeyForEnum({ name }: EnumValue): string {
    return name.pascalCase;
}
