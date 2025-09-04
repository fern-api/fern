import { sanitizeLiteralValue } from "../literal-enum";

describe("sanitizeLiteralValue", () => {
    describe("empty and whitespace values", () => {
        it("should handle empty string", () => {
            const result = sanitizeLiteralValue("");
            expect(result).toMatchInlineSnapshot(`"empty"`);
        });

        it("should handle whitespace only", () => {
            const result = sanitizeLiteralValue("   ");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle tab and newline characters", () => {
            const result = sanitizeLiteralValue("\t\n\r");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });
    });

    describe("numeric values", () => {
        it("should handle string starting with number", () => {
            const result = sanitizeLiteralValue("123abc");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle pure numeric string", () => {
            const result = sanitizeLiteralValue("123");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle negative numbers", () => {
            const result = sanitizeLiteralValue("-42");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle decimal numbers", () => {
            const result = sanitizeLiteralValue("3.14");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });
    });

    describe("special characters", () => {
        it("should handle spaces", () => {
            const result = sanitizeLiteralValue("hello world");
            expect(result).toMatchInlineSnapshot(`"helloWorld"`);
        });

        it("should handle hyphens", () => {
            const result = sanitizeLiteralValue("hello-world");
            expect(result).toMatchInlineSnapshot(`"helloWorld"`);
        });

        it("should handle underscores", () => {
            const result = sanitizeLiteralValue("hello_world");
            expect(result).toMatchInlineSnapshot(`"helloWorld"`);
        });

        it("should handle dots", () => {
            const result = sanitizeLiteralValue("com.example.app");
            expect(result).toMatchInlineSnapshot(`"comExampleApp"`);
        });

        it("should handle forward slashes", () => {
            const result = sanitizeLiteralValue("application/json");
            expect(result).toMatchInlineSnapshot(`"applicationJson"`);
        });

        it("should handle colons", () => {
            const result = sanitizeLiteralValue("http://example.com");
            expect(result).toMatchInlineSnapshot(`"httpExampleCom"`);
        });
    });

    describe("punctuation and symbols", () => {
        it("should handle exclamation marks", () => {
            const result = sanitizeLiteralValue("hello!");
            expect(result).toMatchInlineSnapshot(`"hello"`);
        });

        it("should handle question marks", () => {
            const result = sanitizeLiteralValue("are you sure?");
            expect(result).toMatchInlineSnapshot(`"areYouSure"`);
        });

        it("should handle parentheses", () => {
            const result = sanitizeLiteralValue("func(arg)");
            expect(result).toMatchInlineSnapshot(`"funcArg"`);
        });

        it("should handle brackets", () => {
            const result = sanitizeLiteralValue("array[0]");
            expect(result).toMatchInlineSnapshot(`"array0"`);
        });

        it("should handle braces", () => {
            const result = sanitizeLiteralValue("{key: value}");
            expect(result).toMatchInlineSnapshot(`"keyValue"`);
        });

        it("should handle at symbols", () => {
            const result = sanitizeLiteralValue("@property");
            expect(result).toMatchInlineSnapshot(`"property"`);
        });

        it("should handle hash symbols", () => {
            const result = sanitizeLiteralValue("#hashTag");
            expect(result).toMatchInlineSnapshot(`"hashTag"`);
        });

        it("should handle dollar signs", () => {
            const result = sanitizeLiteralValue("$variable");
            expect(result).toMatchInlineSnapshot(`"variable"`);
        });

        it("should handle percent signs", () => {
            const result = sanitizeLiteralValue("50%");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle ampersands", () => {
            const result = sanitizeLiteralValue("rock&roll");
            expect(result).toMatchInlineSnapshot(`"rockRoll"`);
        });

        it("should handle asterisks", () => {
            const result = sanitizeLiteralValue("*wildcard");
            expect(result).toMatchInlineSnapshot(`"wildcard"`);
        });

        it("should handle plus signs", () => {
            const result = sanitizeLiteralValue("+1");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle equals signs", () => {
            const result = sanitizeLiteralValue("a=b");
            expect(result).toMatchInlineSnapshot(`"aB"`);
        });

        it("should handle less than and greater than", () => {
            const result = sanitizeLiteralValue("<tag>");
            expect(result).toMatchInlineSnapshot(`"tag"`);
        });
    });

    describe("Unicode and international characters", () => {
        it("should handle accented characters", () => {
            const result = sanitizeLiteralValue("café");
            expect(result).toMatchInlineSnapshot(`"cafe"`);
        });

        it("should handle emoji", () => {
            const result = sanitizeLiteralValue("🚀rocket");
            expect(result).toMatchInlineSnapshot(`"rocket"`);
        });

        it("should handle Chinese characters", () => {
            const result = sanitizeLiteralValue("你好");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle Arabic characters", () => {
            const result = sanitizeLiteralValue("مرحبا");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle Japanese characters", () => {
            const result = sanitizeLiteralValue("こんにちは");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });
    });

    describe("already valid values", () => {
        it("should pass through simple lowercase strings unchanged", () => {
            const result = sanitizeLiteralValue("hello");
            expect(result).toMatchInlineSnapshot(`"hello"`);
        });

        it("should pass through simple uppercase strings unchanged", () => {
            const result = sanitizeLiteralValue("HELLO");
            expect(result).toMatchInlineSnapshot(`"HELLO"`);
        });

        it("should pass through mixed case strings unchanged", () => {
            const result = sanitizeLiteralValue("HelloWorld");
            expect(result).toMatchInlineSnapshot(`"HelloWorld"`);
        });

        it("should pass through strings with trailing digits unchanged", () => {
            const result = sanitizeLiteralValue("value123");
            expect(result).toMatchInlineSnapshot(`"value123"`);
        });

        it("should pass through single letter unchanged", () => {
            const result = sanitizeLiteralValue("a");
            expect(result).toMatchInlineSnapshot(`"a"`);
        });

        it("should pass through camelCase strings unchanged", () => {
            const result = sanitizeLiteralValue("camelCaseString");
            expect(result).toMatchInlineSnapshot(`"camelCaseString"`);
        });

        it("should pass through mixed letters and digits unchanged", () => {
            const result = sanitizeLiteralValue("abc123def456");
            expect(result).toMatchInlineSnapshot(`"abc123def456"`);
        });

        it("should pass through reserved keywords unchanged", () => {
            const result = sanitizeLiteralValue("class");
            expect(result).toMatchInlineSnapshot(`"class"`);
        });
    });

    describe("edge cases", () => {
        it("should handle mixed problematic characters", () => {
            const result = sanitizeLiteralValue("123-hello world!@#$%^&*()");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle string with only special characters", () => {
            const result = sanitizeLiteralValue("!@#$%^&*()");
            expect(result).toMatchInlineSnapshot(`"value"`);
        });

        it("should handle backslashes", () => {
            const result = sanitizeLiteralValue("path\\to\\file");
            expect(result).toMatchInlineSnapshot(`"pathToFile"`);
        });

        it("should handle quotes", () => {
            const result = sanitizeLiteralValue('"quoted string"');
            expect(result).toMatchInlineSnapshot(`"quotedString"`);
        });

        it("should handle single quotes", () => {
            const result = sanitizeLiteralValue("'single quoted'");
            expect(result).toMatchInlineSnapshot(`"singleQuoted"`);
        });

        it("should handle backticks", () => {
            const result = sanitizeLiteralValue("`backticked`");
            expect(result).toMatchInlineSnapshot(`"backticked"`);
        });
    });
});
