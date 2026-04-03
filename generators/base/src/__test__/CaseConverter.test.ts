import { Name, NameAndWireValue } from "@fern-api/ir-sdk";
import { CaseConverter } from "../utils/CaseConverter.js";
import { getOriginalName, getWireValue } from "../utils/NameHelpers.js";

function makeName(originalName: string): Name {
    const words = originalName.split(/(?=[A-Z])|_/).map((w) => w.toLowerCase());
    const camel =
        words[0] +
        words
            .slice(1)
            .map((w) => w[0]?.toUpperCase() + w.slice(1))
            .join("");
    const pascal = words.map((w) => w[0]?.toUpperCase() + w.slice(1)).join("");
    const snake = words.join("_");
    const screaming = snake.toUpperCase();
    return {
        originalName,
        camelCase: { safeName: camel, unsafeName: `${camel}_` },
        pascalCase: { safeName: pascal, unsafeName: `${pascal}_` },
        snakeCase: { safeName: snake, unsafeName: `${snake}_` },
        screamingSnakeCase: { safeName: screaming, unsafeName: `${screaming}_` }
    };
}

function makeNameAndWireValue(originalName: string, wireValue: string): NameAndWireValue {
    return {
        wireValue,
        name: makeName(originalName)
    };
}

describe("CaseConverter", () => {
    const caseConverter = new CaseConverter({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: true
    });

    describe("getOriginalName", () => {
        it("returns string directly", () => {
            expect(getOriginalName("myField")).toBe("myField");
        });

        it("returns originalName from Name object", () => {
            expect(getOriginalName(makeName("myField"))).toBe("myField");
        });

        it("returns originalName from NameAndWireValue object", () => {
            expect(getOriginalName(makeNameAndWireValue("myField", "my_field"))).toBe("myField");
        });

        it("returns string directly for NameOrString", () => {
            expect(getOriginalName("myField")).toBe("myField");
        });

        it("returns originalName from Name for NameOrString", () => {
            expect(getOriginalName(makeName("myField"))).toBe("myField");
        });
    });

    describe("getWireValue", () => {
        it("returns string directly for string input", () => {
            expect(getWireValue("myField")).toBe("myField");
        });

        it("returns wireValue from NameAndWireValue object", () => {
            expect(getWireValue(makeNameAndWireValue("myField", "my_field"))).toBe("my_field");
        });
    });

    describe("camelCase", () => {
        it("computes camelCase from a string", () => {
            const result = caseConverter.camelUnsafe("my_field");
            expect(result).toBe("myField");
        });

        it("returns pre-computed camelCase from Name object", () => {
            expect(caseConverter.camelUnsafe(makeName("myField"))).toBe("myField_");
        });

        it("returns pre-computed camelCase safe from Name object", () => {
            expect(caseConverter.camelSafe(makeName("myField"))).toBe("myField");
        });

        it("computes camelCase safe from a string", () => {
            const result = caseConverter.camelSafe("my_field");
            expect(result).toBe("myField");
        });
    });

    describe("pascalCase", () => {
        it("computes PascalCase from a string", () => {
            const result = caseConverter.pascalUnsafe("my_field");
            expect(result).toBe("MyField");
        });

        it("returns pre-computed pascalCase from Name object", () => {
            expect(caseConverter.pascalUnsafe(makeName("myField"))).toBe("MyField_");
        });

        it("returns pre-computed pascalCase safe from Name object", () => {
            expect(caseConverter.pascalSafe(makeName("myField"))).toBe("MyField");
        });

        it("computes PascalCase safe from a string", () => {
            const result = caseConverter.pascalSafe("my_field");
            expect(result).toBe("MyField");
        });
    });

    describe("snakeCase", () => {
        it("computes snake_case from a string", () => {
            const result = caseConverter.snakeUnsafe("myField");
            expect(result).toBe("my_field");
        });

        it("returns pre-computed snakeCase from Name object", () => {
            expect(caseConverter.snakeUnsafe(makeName("myField"))).toBe("my_field_");
        });

        it("returns pre-computed snakeCase safe from Name object", () => {
            expect(caseConverter.snakeSafe(makeName("myField"))).toBe("my_field");
        });

        it("computes snake_case safe from a string", () => {
            const result = caseConverter.snakeSafe("myField");
            expect(result).toBe("my_field");
        });
    });

    describe("screamingSnakeCase", () => {
        it("computes SCREAMING_SNAKE_CASE from a string", () => {
            const result = caseConverter.screamingSnakeUnsafe("myField");
            expect(result).toBe("MY_FIELD");
        });

        it("returns pre-computed screamingSnakeCase from Name object", () => {
            expect(caseConverter.screamingSnakeUnsafe(makeName("myField"))).toBe("MY_FIELD_");
        });

        it("returns pre-computed screamingSnakeCase safe from Name object", () => {
            expect(caseConverter.screamingSnakeSafe(makeName("myField"))).toBe("MY_FIELD");
        });

        it("computes SCREAMING_SNAKE_CASE safe from a string", () => {
            const result = caseConverter.screamingSnakeSafe("myField");
            expect(result).toBe("MY_FIELD");
        });
    });

    describe("resolveName", () => {
        it("generates full Name from a string", () => {
            const resolved = caseConverter.resolve("myField");
            expect(resolved.originalName).toBe("myField");
            expect(resolved.camelCase).toBeDefined();
            expect(resolved.pascalCase).toBeDefined();
            expect(resolved.snakeCase).toBeDefined();
            expect(resolved.screamingSnakeCase).toBeDefined();
        });

        it("returns Name as-is when given a Name object", () => {
            const name = makeName("myField");
            const resolved = caseConverter.resolve(name);
            expect(resolved.originalName).toBe("myField");
        });

        it("extracts and resolves inner name from NameAndWireValue", () => {
            const nameAndWireValue = makeNameAndWireValue("myField", "my_field");
            const resolved = caseConverter.resolve(nameAndWireValue);
            expect(resolved.originalName).toBe("myField");
        });
    });

    describe("resolveNameOrString", () => {
        it("generates full Name from string", () => {
            const resolved = caseConverter.resolveNameOrString("myField");
            expect(resolved.originalName).toBe("myField");
            expect(resolved.camelCase).toBeDefined();
        });

        it("returns Name as-is from Name object", () => {
            const name = makeName("myField");
            const resolved = caseConverter.resolveNameOrString(name);
            expect(resolved.originalName).toBe("myField");
        });
    });

    describe("resolveNameAndWireValue", () => {
        it("generates full NameAndWireValue from string", () => {
            const resolved = caseConverter.resolveNameAndWireValue("myField");
            expect(resolved.wireValue).toBe("myField");
            expect(typeof resolved.name).not.toBe("string");
        });

        it("returns NameAndWireValue as-is", () => {
            const original = makeNameAndWireValue("myField", "my_field");
            const resolved = caseConverter.resolveNameAndWireValue(original);
            expect(resolved.wireValue).toBe("my_field");
        });
    });

    describe("NameAndWireValue with string name (compressed form)", () => {
        it("handles NameAndWireValue where name is a string", () => {
            const compressed = { wireValue: "my_field", name: "myField" };
            expect(getOriginalName(compressed)).toBe("myField");
            expect(getWireValue(compressed)).toBe("my_field");
        });
    });

    describe("language-specific keywords", () => {
        it("creates converter with language-specific keywords", () => {
            const tsConverter = new CaseConverter({
                generationLanguage: "typescript",
                keywords: ["class", "interface"],
                smartCasing: true
            });
            // Should work without errors
            const result = tsConverter.pascalUnsafe("myField");
            expect(result).toBe("MyField");
        });

        it("creates converter with smartCasing disabled", () => {
            const converter = new CaseConverter({
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: false
            });
            const result = converter.pascalUnsafe("myField");
            expect(typeof result).toBe("string");
        });
    });

    describe("multi-word strings", () => {
        it("handles snake_case input", () => {
            expect(caseConverter.pascalUnsafe("user_name")).toBe("UserName");
            expect(caseConverter.camelUnsafe("user_name")).toBe("userName");
        });

        it("handles PascalCase input", () => {
            expect(caseConverter.snakeUnsafe("UserName")).toBe("user_name");
            expect(caseConverter.camelUnsafe("UserName")).toBe("userName");
        });

        it("handles camelCase input", () => {
            expect(caseConverter.pascalUnsafe("userName")).toBe("UserName");
            expect(caseConverter.snakeUnsafe("userName")).toBe("user_name");
        });
    });
});
