import { LiteralEnumGenerator } from "../LiteralEnumGenerator";

describe("LiteralEnumGenerator.sanitizeLiteralValue", () => {
    describe("empty and whitespace values", () => {
        it("should handle empty string", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("");
            expect(result).toMatchInlineSnapshot(`"empty"`);
        });

        it("should handle whitespace only", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("   ");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle tab and newline characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("\t\n\r");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });
    });

    describe("numeric values", () => {
        it("should handle string starting with number", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("123abc");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle pure numeric string", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("123");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle negative numbers", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("-42");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle decimal numbers", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("3.14");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });
    });

    describe("special characters", () => {
        it("should handle spaces", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello world");
            expect(result).toMatchInlineSnapshot(`"helloWorld"`);
        });

        it("should handle hyphens", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello-world");
            expect(result).toMatchInlineSnapshot(`"helloWorld"`);
        });

        it("should handle underscores", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello_world");
            expect(result).toMatchInlineSnapshot(`"helloWorld"`);
        });

        it("should handle dots", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("com.example.app");
            expect(result).toMatchInlineSnapshot(`"comExampleApp"`);
        });

        it("should handle forward slashes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("application/json");
            expect(result).toMatchInlineSnapshot(`"applicationJson"`);
        });

        it("should handle colons", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("http://example.com");
            expect(result).toMatchInlineSnapshot(`"httpExampleCom"`);
        });
    });

    describe("punctuation and symbols", () => {
        it("should handle exclamation marks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello!");
            expect(result).toMatchInlineSnapshot(`"hello"`);
        });

        it("should handle question marks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("are you sure?");
            expect(result).toMatchInlineSnapshot(`"areYouSure"`);
        });

        it("should handle parentheses", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("func(arg)");
            expect(result).toMatchInlineSnapshot(`"funcArg"`);
        });

        it("should handle brackets", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("array[0]");
            expect(result).toMatchInlineSnapshot(`"array0"`);
        });

        it("should handle braces", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("{key: value}");
            expect(result).toMatchInlineSnapshot(`"keyValue"`);
        });

        it("should handle at symbols", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("@property");
            expect(result).toMatchInlineSnapshot(`"property"`);
        });

        it("should handle hash symbols", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("#hashTag");
            expect(result).toMatchInlineSnapshot(`"hashTag"`);
        });

        it("should handle dollar signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("$variable");
            expect(result).toMatchInlineSnapshot(`"variable"`);
        });

        it("should handle percent signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("50%");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle ampersands", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("rock&roll");
            expect(result).toMatchInlineSnapshot(`"rockRoll"`);
        });

        it("should handle asterisks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("*wildcard");
            expect(result).toMatchInlineSnapshot(`"wildcard"`);
        });

        it("should handle plus signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("+1");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle equals signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("a=b");
            expect(result).toMatchInlineSnapshot(`"aB"`);
        });

        it("should handle less than and greater than", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("<tag>");
            expect(result).toMatchInlineSnapshot(`"tag"`);
        });
    });

    describe("Unicode and international characters", () => {
        it("should handle accented characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("café");
            expect(result).toMatchInlineSnapshot(`"cafe"`);
        });

        it("should handle emoji", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("🚀rocket");
            expect(result).toMatchInlineSnapshot(`"rocket"`);
        });

        it("should handle Chinese characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("你好");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle Arabic characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("مرحبا");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle Japanese characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("こんにちは");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });
    });

    describe("already valid values", () => {
        it("should pass through simple lowercase strings unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello");
            expect(result).toMatchInlineSnapshot(`"hello"`);
        });

        it("should pass through simple uppercase strings unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("HELLO");
            expect(result).toMatchInlineSnapshot(`"HELLO"`);
        });

        it("should pass through mixed case strings unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("HelloWorld");
            expect(result).toMatchInlineSnapshot(`"HelloWorld"`);
        });

        it("should pass through strings with trailing digits unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("value123");
            expect(result).toMatchInlineSnapshot(`"value123"`);
        });

        it("should pass through single letter unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("a");
            expect(result).toMatchInlineSnapshot(`"a"`);
        });

        it("should pass through camelCase strings unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("camelCaseString");
            expect(result).toMatchInlineSnapshot(`"camelCaseString"`);
        });

        it("should pass through mixed letters and digits unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("abc123def456");
            expect(result).toMatchInlineSnapshot(`"abc123def456"`);
        });

        it("should pass through reserved keywords unchanged", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("class");
            expect(result).toMatchInlineSnapshot(`"class"`);
        });
    });

    describe("edge cases", () => {
        it("should handle mixed problematic characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("123-hello world!@#$%^&*()");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle string with only special characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("!@#$%^&*()");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle backslashes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("path\\to\\file");
            expect(result).toMatchInlineSnapshot(`"pathToFile"`);
        });

        it("should handle quotes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue('"quoted string"');
            expect(result).toMatchInlineSnapshot(`"quotedString"`);
        });

        it("should handle single quotes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("'single quoted'");
            expect(result).toMatchInlineSnapshot(`"singleQuoted"`);
        });

        it("should handle backticks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("`backticked`");
            expect(result).toMatchInlineSnapshot(`"backticked"`);
        });
    });
});
