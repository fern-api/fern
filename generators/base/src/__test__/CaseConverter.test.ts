import { Name, NameAndWireValue } from "@fern-api/ir-sdk";
import { CaseConverter } from "../utils/CaseConverter.js";

function makeName(originalName: string): Name {
    return {
        originalName,
        camelCase: { safeName: `${originalName}Camel`, unsafeName: `${originalName}CamelUnsafe` },
        pascalCase: { safeName: `${originalName}Pascal`, unsafeName: `${originalName}PascalUnsafe` },
        snakeCase: { safeName: `${originalName}_snake`, unsafeName: `${originalName}_snake_unsafe` },
        screamingSnakeCase: { safeName: `${originalName}_SCREAMING`, unsafeName: `${originalName}_SCREAMING_UNSAFE` }
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

    describe("originalName", () => {
        it("returns string directly", () => {
            expect(caseConverter.originalName("myField")).toBe("myField");
        });

        it("returns originalName from Name object", () => {
            expect(caseConverter.originalName(makeName("myField"))).toBe("myField");
        });

        it("returns originalName from NameAndWireValue object", () => {
            expect(caseConverter.originalName(makeNameAndWireValue("myField", "my_field"))).toBe("myField");
        });
    });

    describe("originalNameFromNameOrString", () => {
        it("returns string directly", () => {
            expect(caseConverter.originalNameFromNameOrString("myField")).toBe("myField");
        });

        it("returns originalName from Name object", () => {
            expect(caseConverter.originalNameFromNameOrString(makeName("myField"))).toBe("myField");
        });
    });

    describe("wireValue", () => {
        it("returns string directly for string input", () => {
            expect(caseConverter.wireValue("myField")).toBe("myField");
        });

        it("returns wireValue from NameAndWireValue object", () => {
            expect(caseConverter.wireValue(makeNameAndWireValue("myField", "my_field"))).toBe("my_field");
        });
    });

    describe("camelCase", () => {
        it("computes camelCase from a string", () => {
            const result = caseConverter.camelCaseUnsafe("my_field");
            expect(result).toBe("myField");
        });

        it("returns pre-computed camelCase from Name object", () => {
            expect(caseConverter.camelCaseUnsafe(makeName("test"))).toBe("testCamelUnsafe");
        });

        it("returns pre-computed camelCase safe from Name object", () => {
            expect(caseConverter.camelCaseSafe(makeName("test"))).toBe("testCamel");
        });

        it("computes camelCase safe from a string", () => {
            const result = caseConverter.camelCaseSafe("my_field");
            expect(result).toBe("myField");
        });
    });

    describe("pascalCase", () => {
        it("computes PascalCase from a string", () => {
            const result = caseConverter.pascalCaseUnsafe("my_field");
            expect(result).toBe("MyField");
        });

        it("returns pre-computed pascalCase from Name object", () => {
            expect(caseConverter.pascalCaseUnsafe(makeName("test"))).toBe("testPascalUnsafe");
        });

        it("returns pre-computed pascalCase safe from Name object", () => {
            expect(caseConverter.pascalCaseSafe(makeName("test"))).toBe("testPascal");
        });

        it("computes PascalCase safe from a string", () => {
            const result = caseConverter.pascalCaseSafe("my_field");
            expect(result).toBe("MyField");
        });
    });

    describe("snakeCase", () => {
        it("computes snake_case from a string", () => {
            const result = caseConverter.snakeCaseUnsafe("myField");
            expect(result).toBe("my_field");
        });

        it("returns pre-computed snakeCase from Name object", () => {
            expect(caseConverter.snakeCaseUnsafe(makeName("test"))).toBe("test_snake_unsafe");
        });

        it("returns pre-computed snakeCase safe from Name object", () => {
            expect(caseConverter.snakeCaseSafe(makeName("test"))).toBe("test_snake");
        });

        it("computes snake_case safe from a string", () => {
            const result = caseConverter.snakeCaseSafe("myField");
            expect(result).toBe("my_field");
        });
    });

    describe("screamingSnakeCase", () => {
        it("computes SCREAMING_SNAKE_CASE from a string", () => {
            const result = caseConverter.screamingSnakeCaseUnsafe("myField");
            expect(result).toBe("MY_FIELD");
        });

        it("returns pre-computed screamingSnakeCase from Name object", () => {
            expect(caseConverter.screamingSnakeCaseUnsafe(makeName("test"))).toBe("test_SCREAMING_UNSAFE");
        });

        it("returns pre-computed screamingSnakeCase safe from Name object", () => {
            expect(caseConverter.screamingSnakeCaseSafe(makeName("test"))).toBe("test_SCREAMING");
        });

        it("computes SCREAMING_SNAKE_CASE safe from a string", () => {
            const result = caseConverter.screamingSnakeCaseSafe("myField");
            expect(result).toBe("MY_FIELD");
        });
    });

    describe("resolveName", () => {
        it("generates full Name from a string", () => {
            const resolved = caseConverter.resolveName("myField");
            expect(resolved.originalName).toBe("myField");
            expect(resolved.camelCase).toBeDefined();
            expect(resolved.pascalCase).toBeDefined();
            expect(resolved.snakeCase).toBeDefined();
            expect(resolved.screamingSnakeCase).toBeDefined();
        });

        it("returns Name as-is when given a Name object", () => {
            const name = makeName("myField");
            const resolved = caseConverter.resolveName(name);
            expect(resolved.originalName).toBe("myField");
        });

        it("extracts and resolves inner name from NameAndWireValue", () => {
            const nameAndWireValue = makeNameAndWireValue("myField", "my_field");
            const resolved = caseConverter.resolveName(nameAndWireValue);
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
            expect(caseConverter.originalName(compressed)).toBe("myField");
            expect(caseConverter.wireValue(compressed)).toBe("my_field");
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
            const result = tsConverter.pascalCaseUnsafe("myField");
            expect(result).toBe("MyField");
        });

        it("creates converter with smartCasing disabled", () => {
            const converter = new CaseConverter({
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: false
            });
            const result = converter.pascalCaseUnsafe("myField");
            expect(typeof result).toBe("string");
        });
    });

    describe("multi-word strings", () => {
        it("handles snake_case input", () => {
            expect(caseConverter.pascalCaseUnsafe("user_name")).toBe("UserName");
            expect(caseConverter.camelCaseUnsafe("user_name")).toBe("userName");
        });

        it("handles PascalCase input", () => {
            expect(caseConverter.snakeCaseUnsafe("UserName")).toBe("user_name");
            expect(caseConverter.camelCaseUnsafe("UserName")).toBe("userName");
        });

        it("handles camelCase input", () => {
            expect(caseConverter.pascalCaseUnsafe("userName")).toBe("UserName");
            expect(caseConverter.snakeCaseUnsafe("userName")).toBe("user_name");
        });
    });
});
