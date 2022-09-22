import { SingleUnionType } from "@fern-fern/ir-model/types";

export function getKeyForUnion({ discriminantValue }: SingleUnionType): string {
    return discriminantValue.pascalCase;
}
