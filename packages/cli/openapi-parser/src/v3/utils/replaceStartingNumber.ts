const NUMERIC_REGEX = /^(\d+)/;
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

export function convertNumberToSnakeCase(number: number): string | undefined {
    const singleDigits = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

    const teenNumbers = [
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen"
    ];

    const tensNumbers = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    if (number < 0 || number > 9999) {
        return undefined;
    }

    if (number < 10) {
        return singleDigits[number];
    }

    if (number < 20) {
        return teenNumbers[number - 10];
    }

    if (number < 100) {
        const tens = Math.floor(number / 10);
        const remainder = number % 10;

        if (remainder === 0) {
            return tensNumbers[tens];
        } else {
            return `${tensNumbers[tens]}_${singleDigits[remainder]}`;
        }
    }

    if (number < 1000) {
        const hundreds = Math.floor(number / 100);
        const remainder = number % 100;

        if (remainder === 0) {
            return `${singleDigits[hundreds]}_hundred`;
        } else {
            return `${singleDigits[hundreds]}_hundred_${convertNumberToSnakeCase(remainder)}`;
        }
    }

    const thousands = Math.floor(number / 1000);
    const remainder = number % 1000;

    if (remainder === 0) {
        return `${singleDigits[thousands]}_thousand`;
    } else {
        return `${singleDigits[thousands]}_thousand_${convertNumberToSnakeCase(remainder)}`;
    }
}
