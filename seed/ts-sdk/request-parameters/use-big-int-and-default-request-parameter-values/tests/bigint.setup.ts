import { expect } from "@jest/globals";

expect.addEqualityTesters([
    (a: any, b: any) => {
        if ((typeof a === "bigint" && typeof b === "number") || (typeof a === "number" && typeof b === "bigint")) {
            return BigInt(a) === BigInt(b);
        }
        // Return undefined to let Jest handle other comparisons normally
        return undefined;
    }
]);

export {};
