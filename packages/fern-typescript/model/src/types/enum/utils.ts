import { EnumValue } from "@fern/ir-generation";
import { uppercaseFirstLetter } from "../../utils/uppercaseFirstLetter";

export function getKeyForEnum({ value }: EnumValue): string {
    return uppercaseFirstLetter(value);
}
