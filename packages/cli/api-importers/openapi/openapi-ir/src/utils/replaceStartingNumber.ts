import { convertNumberToSnakeCase } from "./convertNumberToSnakeCase";
import { NUMERIC_REGEX } from "./constants";

export function replaceStartingNumber(input: string): string | undefined {
    const matches = input.match(NUMERIC_REGEX);
    if (matches && matches[0] != null) {
        const numericPart = matches[0];
        const nonNumericPart = input.substring(numericPart.length);
        const parsedNumber = parseFloat(numericPart);
        if (!isNaN(parsedNumber) && isFinite(parsedNumber)) {
            const snakeCasedNumber = convertNumberToSnakeCase(parsedNumber);
            return nonNumericPart.length > 0 ? `${snakeCasedNumber}_${nonNumericPart}` : snakeCasedNumber;
        }
    }
    return undefined;
}