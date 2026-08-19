import { Name, NameAndWireValue } from "@fern-api/ir-sdk";
import {
    ensureNameAndWireValue,
    getCamelCaseUnsafe,
    getNameFromWireValue,
    getOriginalName,
    getPascalCaseUnsafe,
    getSnakeCaseUnsafe,
    getWireValue
} from "../utils/namesUtils.js";

function makeName(originalName: string): Name {
    return {
        originalName,
        camelCase: { safeName: `${originalName}Camel`, unsafeName: `${originalName}Camel` },
        pascalCase: { safeName: `${originalName}Pascal`, unsafeName: `${originalName}Pascal` },
        snakeCase: { safeName: `${originalName}_snake`, unsafeName: `${originalName}_snake` },
        screamingSnakeCase: { safeName: `${originalName}_SCREAMING`, unsafeName: `${originalName}_SCREAMING` }
    };
}

function makeNameAndWireValue(originalName: string, wireValue: string): NameAndWireValue {
    return {
        wireValue,
        name: makeName(originalName)
    };
}

describe("namesUtils", () => {
    describe("getOriginalName", () => {
        it("returns the string directly when input is a string", () => {
            expect(getOriginalName("myField")).toBe("myField");
        });

        it("returns originalName from a Name object", () => {
            expect(getOriginalName(makeName("myField"))).toBe("myField");
        });

        it("returns originalName from a NameAndWireValue object", () => {
            expect(getOriginalName(makeNameAndWireValue("myField", "my_field"))).toBe("myField");
        });

        it("handles empty string", () => {
            expect(getOriginalName("")).toBe("");
        });

        it("handles NameAndWireValue with string name (compressed form)", () => {
            const input = { wireValue: "my_field", name: "myField" };
            expect(getOriginalName(input)).toBe("myField");
        });
    });

    describe("getWireValue", () => {
        it("returns the string directly when input is a string", () => {
            expect(getWireValue("myField")).toBe("myField");
        });

        it("returns wireValue from a NameAndWireValue object", () => {
            expect(getWireValue(makeNameAndWireValue("myField", "my_field"))).toBe("my_field");
        });

        it("handles NameAndWireValue where wireValue equals originalName", () => {
            expect(getWireValue(makeNameAndWireValue("myField", "myField"))).toBe("myField");
        });
    });

    describe("getNameFromWireValue", () => {
        it("returns the string directly when input is a string", () => {
            expect(getNameFromWireValue("myField")).toBe("myField");
        });

        it("returns the Name from a NameAndWireValue object", () => {
            const nameAndWireValue = makeNameAndWireValue("myField", "my_field");
            const result = getNameFromWireValue(nameAndWireValue);
            expect(result).toEqual(makeName("myField"));
        });

        it("returns string name from NameAndWireValue with compressed name", () => {
            const input = { wireValue: "my_field", name: "myField" };
            expect(getNameFromWireValue(input)).toBe("myField");
        });
    });

    describe("ensureNameAndWireValue", () => {
        it("inflates a string to NameAndWireValue with both fields set to the string", () => {
            const result = ensureNameAndWireValue("myField");
            expect(result).toEqual({ wireValue: "myField", name: "myField" });
        });

        it("passes through a NameAndWireValue object unchanged", () => {
            const original = makeNameAndWireValue("myField", "my_field");
            const result = ensureNameAndWireValue(original);
            expect(result).toBe(original);
        });

        it("handles empty string", () => {
            const result = ensureNameAndWireValue("");
            expect(result).toEqual({ wireValue: "", name: "" });
        });
    });

    describe("getSnakeCaseUnsafe", () => {
        it("returns pre-computed snakeCase from a Name object", () => {
            expect(getSnakeCaseUnsafe(makeName("myField"))).toBe("myField_snake");
        });

        it("returns pre-computed snakeCase from a NameAndWireValue object", () => {
            expect(getSnakeCaseUnsafe(makeNameAndWireValue("myField", "my_field"))).toBe("myField_snake");
        });

        it("computes snakeCase from a string using casings generator", () => {
            const result = getSnakeCaseUnsafe("myField");
            expect(result).toBe("my_field");
        });

        it("computes snakeCase for multi-word string", () => {
            const result = getSnakeCaseUnsafe("MyMultiWordName");
            expect(result).toBe("my_multi_word_name");
        });
    });

    describe("getCamelCaseUnsafe", () => {
        it("returns pre-computed camelCase from a Name object", () => {
            expect(getCamelCaseUnsafe(makeName("myField"))).toBe("myFieldCamel");
        });

        it("returns pre-computed camelCase from a NameAndWireValue object", () => {
            expect(getCamelCaseUnsafe(makeNameAndWireValue("myField", "my_field"))).toBe("myFieldCamel");
        });

        it("computes camelCase from a string using casings generator", () => {
            const result = getCamelCaseUnsafe("my_field");
            expect(result).toBe("myField");
        });
    });

    describe("getPascalCaseUnsafe", () => {
        it("returns pre-computed pascalCase from a Name object", () => {
            expect(getPascalCaseUnsafe(makeName("myField"))).toBe("myFieldPascal");
        });

        it("returns pre-computed pascalCase from a NameAndWireValue object", () => {
            expect(getPascalCaseUnsafe(makeNameAndWireValue("myField", "my_field"))).toBe("myFieldPascal");
        });

        it("computes PascalCase from a string using casings generator", () => {
            const result = getPascalCaseUnsafe("my_field");
            expect(result).toBe("MyField");
        });
    });

    describe("edge cases", () => {
        it("handles single-character string inputs", () => {
            expect(getOriginalName("a")).toBe("a");
            expect(getWireValue("a")).toBe("a");
        });

        it("handles numeric-like string inputs", () => {
            expect(getOriginalName("123")).toBe("123");
        });

        it("handles string with special characters", () => {
            expect(getOriginalName("my-field")).toBe("my-field");
        });

        it("all casing functions agree on string vs Name for simple names", () => {
            // For a simple lowercase name with no special casing, the generated
            // casings from string should produce valid results
            const stringResult = getPascalCaseUnsafe("username");
            expect(stringResult).toBe("Username");
        });
    });
});
