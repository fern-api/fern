import { replaceSpecialCharsWithWords } from "@fern-api/core-utils";
import { camelCase, upperFirst } from "lodash-es";
import { replaceStartingNumber } from "./replaceStartingNumber.js";
import { HARDCODED_ENUM_NAMES } from "./constants.js";

export function generateEnumNameFromValue(value: string): string {
    const maybeParsedNumber = replaceStartingNumber(value);
    const maybeHardcodedEnumName = HARDCODED_ENUM_NAMES[value];
    if (maybeParsedNumber != null) {
        return upperFirst(camelCase(maybeParsedNumber));
    } else if (maybeHardcodedEnumName != null) {
        return maybeHardcodedEnumName;
    } else {
        if (value.toLowerCase() === "n/a") {
            return "NOT_APPLICABLE";
        }
        // Replace special characters with word equivalents before applying casing
        const withWords = replaceSpecialCharsWithWords(value);
        return upperFirst(camelCase(withWords));
    }
}
