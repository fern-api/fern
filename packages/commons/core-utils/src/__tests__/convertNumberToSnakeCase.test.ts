import { convertNumberToSnakeCase } from "../convertNumberToSnakeCase.js";

describe("convertNumberToSnakeCase", () => {
    it("spells out small numbers", () => {
        expect(convertNumberToSnakeCase(0)).toBe("zero");
        expect(convertNumberToSnakeCase(7)).toBe("seven");
        expect(convertNumberToSnakeCase(21)).toBe("twenty_one");
    });

    it("spells out hundreds and thousands", () => {
        expect(convertNumberToSnakeCase(200)).toBe("two_hundred");
        expect(convertNumberToSnakeCase(404)).toBe("four_hundred_four");
        expect(convertNumberToSnakeCase(3000)).toBe("three_thousand");
    });
});
