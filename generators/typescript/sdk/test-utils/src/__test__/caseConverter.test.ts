import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { caseConverter } from "../caseConverter.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Name = FernIr.Name;
type NameAndWireValue = FernIr.NameAndWireValue;

function makeName(originalName: string): Name {
    return {
        originalName,
        camelCase: { safeName: `${originalName}Camel`, unsafeName: `${originalName}CamelUnsafe` },
        pascalCase: { safeName: `${originalName}Pascal`, unsafeName: `${originalName}PascalUnsafe` },
        snakeCase: { safeName: `${originalName}_snake`, unsafeName: `${originalName}_snake_unsafe` },
        screamingSnakeCase: {
            safeName: `${originalName}_SCREAMING`,
            unsafeName: `${originalName}_SCREAMING_UNSAFE`
        }
    };
}

function makeNameAndWireValue(originalName: string, wireValue: string): NameAndWireValue {
    return { wireValue, name: makeName(originalName) };
}

// Compressed NameAndWireValue: name is a plain string (V66 form)
function makeCompressedNameAndWireValue(name: string, wireValue: string): NameAndWireValue {
    return { wireValue, name: name as unknown as Name };
}

// ---------------------------------------------------------------------------
// originalName
// ---------------------------------------------------------------------------

describe("getOriginalName", () => {
    it("returns string directly", () => {
        expect(getOriginalName("myField")).toBe("myField");
    });

    it("extracts originalName from a Name object", () => {
        expect(getOriginalName(makeName("myField"))).toBe("myField");
    });

    it("extracts originalName from a NameAndWireValue with a full Name", () => {
        expect(getOriginalName(makeNameAndWireValue("myField", "my_field"))).toBe("myField");
    });

    it("extracts originalName from a compressed NameAndWireValue (V66 string name)", () => {
        expect(getOriginalName(makeCompressedNameAndWireValue("myField", "my_field"))).toBe("myField");
    });
});

// ---------------------------------------------------------------------------
// getWireValue
// ---------------------------------------------------------------------------

describe("getWireValue", () => {
    it("returns string directly when input is a string", () => {
        expect(getWireValue("myField")).toBe("myField");
    });

    it("extracts wireValue from a NameAndWireValue object", () => {
        expect(getWireValue(makeNameAndWireValue("myField", "my_field"))).toBe("my_field");
    });

    it("handles wireValue === name (compressed string)", () => {
        expect(getWireValue("status")).toBe("status");
    });
});

// ---------------------------------------------------------------------------
// camelCaseSafe — keyword escaping (core TypeScript-specific behaviour)
// ---------------------------------------------------------------------------

describe("camelSafe", () => {
    describe("computes from string input", () => {
        it("lowercases and camelCases a simple name", () => {
            expect(caseConverter.camelSafe("my_field")).toBe("myField");
        });

        it("escapes TypeScript reserved keyword 'string'", () => {
            expect(caseConverter.camelSafe("string")).toBe("string_");
        });

        it("escapes TypeScript reserved keyword 'class'", () => {
            expect(caseConverter.camelSafe("class")).toBe("class_");
        });

        it("escapes TypeScript reserved keyword 'type'", () => {
            expect(caseConverter.camelSafe("type")).toBe("type_");
        });

        it("escapes TypeScript reserved keyword 'enum'", () => {
            expect(caseConverter.camelSafe("enum")).toBe("enum_");
        });

        it("does not escape non-reserved words", () => {
            expect(caseConverter.camelSafe("status")).toBe("status");
        });
    });

    describe("returns pre-computed safeName from a Name object", () => {
        it("returns the safeName without recomputing", () => {
            expect(caseConverter.camelSafe(makeName("myField"))).toBe("myFieldCamel");
        });
    });

    describe("resolves inner name from NameAndWireValue", () => {
        it("uses the Name from a full NameAndWireValue", () => {
            expect(caseConverter.camelSafe(makeNameAndWireValue("myField", "my_field"))).toBe("myFieldCamel");
        });

        it("computes from compressed NameAndWireValue (string name)", () => {
            expect(caseConverter.camelSafe(makeCompressedNameAndWireValue("my_field", "my_field"))).toBe("myField");
        });

        it("escapes keyword in compressed NameAndWireValue", () => {
            expect(caseConverter.camelSafe(makeCompressedNameAndWireValue("string", "string"))).toBe("string_");
        });
    });
});

// ---------------------------------------------------------------------------
// camelCaseUnsafe — no keyword escaping
// ---------------------------------------------------------------------------

describe("camelUnsafe", () => {
    it("computes camelCase from string without escaping keywords", () => {
        expect(caseConverter.camelUnsafe("string")).toBe("string");
        expect(caseConverter.camelUnsafe("my_field")).toBe("myField");
    });

    it("returns unsafeName from a Name object", () => {
        expect(caseConverter.camelUnsafe(makeName("myField"))).toBe("myFieldCamelUnsafe");
    });

    it("resolves inner name from NameAndWireValue", () => {
        expect(caseConverter.camelUnsafe(makeNameAndWireValue("myField", "my_field"))).toBe("myFieldCamelUnsafe");
    });
});

// ---------------------------------------------------------------------------
// pascalCaseSafe
// ---------------------------------------------------------------------------

describe("pascalSafe", () => {
    it("PascalCases a string and escapes keywords", () => {
        expect(caseConverter.pascalSafe("my_field")).toBe("MyField");
        // "String" (PascalCase of "string") — check whether it collides after casing
        // "string" → PascalCase → "String", which is not in the TypeScript keyword set
        expect(caseConverter.pascalSafe("string")).toBe("String");
    });

    it("escapes TypeScript keyword 'Error' (PascalCase form in keyword set)", () => {
        // "Error" is explicitly in the TypeScript reserved set as-is
        expect(caseConverter.pascalSafe("Error")).toBe("Error_");
    });

    it("escapes TypeScript keyword 'Object'", () => {
        expect(caseConverter.pascalSafe("Object")).toBe("Object_");
    });

    it("returns pre-computed safeName from a Name object", () => {
        expect(caseConverter.pascalSafe(makeName("myField"))).toBe("myFieldPascal");
    });

    it("resolves inner name from NameAndWireValue", () => {
        expect(caseConverter.pascalSafe(makeNameAndWireValue("myField", "my_field"))).toBe("myFieldPascal");
    });

    it("computes from compressed NameAndWireValue", () => {
        expect(caseConverter.pascalSafe(makeCompressedNameAndWireValue("my_field", "my_field"))).toBe("MyField");
    });
});

// ---------------------------------------------------------------------------
// pascalCaseUnsafe
// ---------------------------------------------------------------------------

describe("pascalUnsafe", () => {
    it("PascalCases a string without escaping keywords", () => {
        expect(caseConverter.pascalUnsafe("my_field")).toBe("MyField");
        expect(caseConverter.pascalUnsafe("Error")).toBe("Error");
    });

    it("returns unsafeName from a Name object", () => {
        expect(caseConverter.pascalUnsafe(makeName("myField"))).toBe("myFieldPascalUnsafe");
    });

    it("resolves inner name from NameAndWireValue", () => {
        expect(caseConverter.pascalUnsafe(makeNameAndWireValue("myField", "my_field"))).toBe("myFieldPascalUnsafe");
    });
});

// ---------------------------------------------------------------------------
// snakeCaseSafe
// ---------------------------------------------------------------------------

describe("snakeSafe", () => {
    it("snake_cases a string and escapes keywords", () => {
        expect(caseConverter.snakeSafe("myField")).toBe("my_field");
        // "string" → snake_case → "string" (still a keyword)
        expect(caseConverter.snakeSafe("string")).toBe("string_");
    });

    it("returns pre-computed safeName from a Name object", () => {
        expect(caseConverter.snakeSafe(makeName("myField"))).toBe("myField_snake");
    });

    it("resolves inner name from NameAndWireValue", () => {
        expect(caseConverter.snakeSafe(makeNameAndWireValue("myField", "my_field"))).toBe("myField_snake");
    });

    it("computes from compressed NameAndWireValue", () => {
        expect(caseConverter.snakeSafe(makeCompressedNameAndWireValue("myField", "my_field"))).toBe("my_field");
    });
});

// ---------------------------------------------------------------------------
// snakeCaseUnsafe
// ---------------------------------------------------------------------------

describe("snakeUnsafe", () => {
    it("snake_cases a string without escaping keywords", () => {
        expect(caseConverter.snakeUnsafe("myField")).toBe("my_field");
        expect(caseConverter.snakeUnsafe("string")).toBe("string");
    });

    it("returns unsafeName from a Name object", () => {
        expect(caseConverter.snakeUnsafe(makeName("myField"))).toBe("myField_snake_unsafe");
    });

    it("resolves inner name from NameAndWireValue", () => {
        expect(caseConverter.snakeUnsafe(makeNameAndWireValue("myField", "my_field"))).toBe("myField_snake_unsafe");
    });
});

// ---------------------------------------------------------------------------
// screamingSnakeCaseSafe
// ---------------------------------------------------------------------------

describe("screamingSnakeSafe", () => {
    it("SCREAMING_SNAKE_CASEs a string", () => {
        expect(caseConverter.screamingSnakeSafe("myField")).toBe("MY_FIELD");
    });

    it("returns pre-computed safeName from a Name object", () => {
        expect(caseConverter.screamingSnakeSafe(makeName("myField"))).toBe("myField_SCREAMING");
    });

    it("resolves inner name from NameAndWireValue", () => {
        expect(caseConverter.screamingSnakeSafe(makeNameAndWireValue("myField", "my_field"))).toBe("myField_SCREAMING");
    });

    it("computes from compressed NameAndWireValue", () => {
        expect(caseConverter.screamingSnakeSafe(makeCompressedNameAndWireValue("myField", "my_field"))).toBe(
            "MY_FIELD"
        );
    });
});

// ---------------------------------------------------------------------------
// screamingSnakeCaseUnsafe
// ---------------------------------------------------------------------------

describe("screamingSnakeUnsafe", () => {
    it("SCREAMING_SNAKE_CASEs a string without escaping", () => {
        expect(caseConverter.screamingSnakeUnsafe("myField")).toBe("MY_FIELD");
    });

    it("returns unsafeName from a Name object", () => {
        expect(caseConverter.screamingSnakeUnsafe(makeName("myField"))).toBe("myField_SCREAMING_UNSAFE");
    });

    it("resolves inner name from NameAndWireValue", () => {
        expect(caseConverter.screamingSnakeUnsafe(makeNameAndWireValue("myField", "my_field"))).toBe(
            "myField_SCREAMING_UNSAFE"
        );
    });
});

// ---------------------------------------------------------------------------
// resolveName
// ---------------------------------------------------------------------------

describe("resolve", () => {
    it("generates a full Name from a string", () => {
        const name = caseConverter.resolve("myField");
        expect(name.originalName).toBe("myField");
        expect(name.camelCase).toBeDefined();
        expect(name.pascalCase).toBeDefined();
        expect(name.snakeCase).toBeDefined();
        expect(name.screamingSnakeCase).toBeDefined();
    });

    it("returns a Name object as-is", () => {
        const input = makeName("myField");
        expect(caseConverter.resolve(input)).toBe(input);
    });

    it("resolves inner name from a NameAndWireValue", () => {
        const nav = makeNameAndWireValue("myField", "my_field");
        const name = caseConverter.resolve(nav);
        expect(name).toBe(nav.name);
    });

    it("generates a full Name from a compressed NameAndWireValue", () => {
        const nav = makeCompressedNameAndWireValue("myField", "my_field");
        const name = caseConverter.resolve(nav);
        expect(name.originalName).toBe("myField");
    });
});

// ---------------------------------------------------------------------------
// resolveNameAndWireValue
// ---------------------------------------------------------------------------

describe("resolveAndWireValue", () => {
    it("inflates a string to NameAndWireValue with computed casings", () => {
        const result = caseConverter.resolveNameAndWireValue("my_field");
        expect(result.wireValue).toBe("my_field");
        expect(typeof result.name === "string" ? result.name : result.name.originalName).toBe("my_field");
    });

    it("inflates a compressed NameAndWireValue to full form", () => {
        const result = caseConverter.resolveNameAndWireValue(makeCompressedNameAndWireValue("myField", "my_field"));
        expect(result.wireValue).toBe("my_field");
        const name = result.name as Name;
        expect(name.originalName).toBe("myField");
        expect(name.camelCase).toBeDefined();
    });

    it("resolves a NameAndWireValue with a full Name as-is", () => {
        const input = makeNameAndWireValue("myField", "my_field");
        const result = caseConverter.resolveNameAndWireValue(input);
        expect(result.wireValue).toBe("my_field");
        expect(result.name).toBe(input.name);
    });
});

// ---------------------------------------------------------------------------
// TypeScript keyword escaping — comprehensive safe vs unsafe comparison
// ---------------------------------------------------------------------------

describe("TypeScript keyword escaping: safe vs unsafe", () => {
    const keywords = ["string", "number", "boolean", "class", "enum", "type", "interface", "module"] as const;

    for (const keyword of keywords) {
        it(`camelSafe("${keyword}") appends underscore, camelCaseUnsafe does not`, () => {
            expect(caseConverter.camelSafe(keyword)).toBe(`${keyword}_`);
            expect(caseConverter.camelUnsafe(keyword)).toBe(keyword);
        });
    }

    it('snakeCaseSafe("string") appends underscore', () => {
        expect(caseConverter.snakeSafe("string")).toBe("string_");
        expect(caseConverter.snakeUnsafe("string")).toBe("string");
    });

    it("non-keyword words are not escaped", () => {
        expect(caseConverter.camelSafe("status")).toBe("status");
        expect(caseConverter.camelSafe("myField")).toBe("myField");
    });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
    it("handles empty string input", () => {
        // empty string produces empty casings without error
        expect(getOriginalName("")).toBe("");
        expect(typeof caseConverter.camelSafe("")).toBe("string");
    });

    it("handles single-word names", () => {
        expect(caseConverter.camelSafe("user")).toBe("user");
        expect(caseConverter.pascalSafe("user")).toBe("User");
        expect(caseConverter.snakeSafe("user")).toBe("user");
    });

    it("handles multi-word snake_case string", () => {
        expect(caseConverter.camelSafe("user_id")).toBe("userId");
        expect(caseConverter.pascalSafe("user_id")).toBe("UserId");
        expect(caseConverter.snakeSafe("userId")).toBe("user_id");
    });

    it("handles PascalCase string input", () => {
        expect(caseConverter.camelSafe("MyField")).toBe("myField");
        expect(caseConverter.snakeSafe("MyField")).toBe("my_field");
        expect(caseConverter.screamingSnakeSafe("MyField")).toBe("MY_FIELD");
    });

    it("compressed NameAndWireValue with same name and wireValue", () => {
        const nav = makeCompressedNameAndWireValue("status", "status");
        expect(getWireValue(nav)).toBe("status");
        expect(caseConverter.camelSafe(nav)).toBe("status");
    });
});
