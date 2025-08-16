import { LiteralEnumGenerator } from "../LiteralEnumGenerator";

describe("LiteralEnumGenerator.sanitizeLiteralValue", () => {
    describe("empty and whitespace values", () => {
        it("should handle empty string", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("");
            expect(result).toMatchInlineSnapshot(`"empty"`);
        });

        it("should handle whitespace only", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("   ");
            expect(result).toMatchInlineSnapshot(`"   "`);
        });

        it("should handle tab and newline characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("\t\n\r");
            expect(result).toMatchInlineSnapshot(`
              "	

              "
            `);
        });
    });

    describe("numeric values", () => {
        it("should handle string starting with number", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("123abc");
            expect(result).toMatchInlineSnapshot(`"123abc"`);
        });

        it("should handle pure numeric string", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("123");
            expect(result).toMatchInlineSnapshot(`"123"`);
        });

        it("should handle negative numbers", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("-42");
            expect(result).toMatchInlineSnapshot(`"-42"`);
        });

        it("should handle decimal numbers", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("3.14");
            expect(result).toMatchInlineSnapshot(`"3.14"`);
        });
    });

    describe("special characters", () => {
        it("should handle spaces", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello world");
            expect(result).toMatchInlineSnapshot(`"hello world"`);
        });

        it("should handle hyphens", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello-world");
            expect(result).toMatchInlineSnapshot(`"hello-world"`);
        });

        it("should handle underscores", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello_world");
            expect(result).toMatchInlineSnapshot(`"hello_world"`);
        });

        it("should handle dots", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("com.example.app");
            expect(result).toMatchInlineSnapshot(`"com.example.app"`);
        });

        it("should handle forward slashes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("application/json");
            expect(result).toMatchInlineSnapshot(`"application/json"`);
        });

        it("should handle colons", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("http://example.com");
            expect(result).toMatchInlineSnapshot(`"http://example.com"`);
        });
    });

    describe("punctuation and symbols", () => {
        it("should handle exclamation marks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("hello!");
            expect(result).toMatchInlineSnapshot(`"hello!"`);
        });

        it("should handle question marks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("are you sure?");
            expect(result).toMatchInlineSnapshot(`"are you sure?"`);
        });

        it("should handle parentheses", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("func(arg)");
            expect(result).toMatchInlineSnapshot(`"func(arg)"`);
        });

        it("should handle brackets", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("array[0]");
            expect(result).toMatchInlineSnapshot(`"array[0]"`);
        });

        it("should handle braces", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("{key: value}");
            expect(result).toMatchInlineSnapshot(`"{key: value}"`);
        });

        it("should handle at symbols", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("@property");
            expect(result).toMatchInlineSnapshot(`"@property"`);
        });

        it("should handle hash symbols", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("#hashTag");
            expect(result).toMatchInlineSnapshot(`"#hashTag"`);
        });

        it("should handle dollar signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("$variable");
            expect(result).toMatchInlineSnapshot(`"$variable"`);
        });

        it("should handle percent signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("50%");
            expect(result).toMatchInlineSnapshot(`"50%"`);
        });

        it("should handle ampersands", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("rock&roll");
            expect(result).toMatchInlineSnapshot(`"rock&roll"`);
        });

        it("should handle asterisks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("*wildcard");
            expect(result).toMatchInlineSnapshot(`"*wildcard"`);
        });

        it("should handle plus signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("+1");
            expect(result).toMatchInlineSnapshot(`"+1"`);
        });

        it("should handle equals signs", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("a=b");
            expect(result).toMatchInlineSnapshot(`"a=b"`);
        });

        it("should handle less than and greater than", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("<tag>");
            expect(result).toMatchInlineSnapshot(`"<tag>"`);
        });
    });

    describe("Swift reserved keywords", () => {
        it("should handle 'class' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("class");
            expect(result).toMatchInlineSnapshot(`"class"`);
        });

        it("should handle 'func' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("func");
            expect(result).toMatchInlineSnapshot(`"func"`);
        });

        it("should handle 'var' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("var");
            expect(result).toMatchInlineSnapshot(`"var"`);
        });

        it("should handle 'let' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("let");
            expect(result).toMatchInlineSnapshot(`"let"`);
        });

        it("should handle 'if' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("if");
            expect(result).toMatchInlineSnapshot(`"if"`);
        });

        it("should handle 'else' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("else");
            expect(result).toMatchInlineSnapshot(`"else"`);
        });

        it("should handle 'for' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("for");
            expect(result).toMatchInlineSnapshot(`"for"`);
        });

        it("should handle 'while' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("while");
            expect(result).toMatchInlineSnapshot(`"while"`);
        });

        it("should handle 'switch' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("switch");
            expect(result).toMatchInlineSnapshot(`"switch"`);
        });

        it("should handle 'case' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("case");
            expect(result).toMatchInlineSnapshot(`"case"`);
        });

        it("should handle 'default' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("default");
            expect(result).toMatchInlineSnapshot(`"default"`);
        });

        it("should handle 'enum' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("enum");
            expect(result).toMatchInlineSnapshot(`"enum"`);
        });

        it("should handle 'struct' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("struct");
            expect(result).toMatchInlineSnapshot(`"struct"`);
        });

        it("should handle 'protocol' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("protocol");
            expect(result).toMatchInlineSnapshot(`"protocol"`);
        });

        it("should handle 'extension' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("extension");
            expect(result).toMatchInlineSnapshot(`"extension"`);
        });

        it("should handle 'import' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("import");
            expect(result).toMatchInlineSnapshot(`"import"`);
        });

        it("should handle 'return' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("return");
            expect(result).toMatchInlineSnapshot(`"return"`);
        });

        it("should handle 'throw' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("throw");
            expect(result).toMatchInlineSnapshot(`"throw"`);
        });

        it("should handle 'try' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("try");
            expect(result).toMatchInlineSnapshot(`"try"`);
        });

        it("should handle 'catch' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("catch");
            expect(result).toMatchInlineSnapshot(`"catch"`);
        });

        it("should handle 'do' keyword", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("do");
            expect(result).toMatchInlineSnapshot(`"do"`);
        });
    });

    describe("Unicode and international characters", () => {
        it("should handle accented characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("café");
            expect(result).toMatchInlineSnapshot(`"café"`);
        });

        it("should handle emoji", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("🚀rocket");
            expect(result).toMatchInlineSnapshot(`"🚀rocket"`);
        });

        it("should handle Chinese characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("你好");
            expect(result).toMatchInlineSnapshot(`"你好"`);
        });

        it("should handle Arabic characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("مرحبا");
            expect(result).toMatchInlineSnapshot(`"مرحبا"`);
        });

        it("should handle Japanese characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("こんにちは");
            expect(result).toMatchInlineSnapshot(`"こんにちは"`);
        });
    });

    describe("edge cases", () => {
        it("should handle very long strings", () => {
            const longString = "a".repeat(1000);
            const result = LiteralEnumGenerator.sanitizeLiteralValue(longString);
            expect(result).toMatchInlineSnapshot(`"${"a".repeat(1000)}"`);
        });

        it("should handle mixed problematic characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("123-hello world!@#$%^&*()");
            expect(result).toMatchInlineSnapshot(`"123-hello world!@#$%^&*()"`);
        });

        it("should handle string with only special characters", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("!@#$%^&*()");
            expect(result).toMatchInlineSnapshot(`"!@#$%^&*()"`);
        });

        it("should handle backslashes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("path\\to\\file");
            expect(result).toMatchInlineSnapshot(`"path\\to\\file"`);
        });

        it("should handle quotes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue('"quoted string"');
            expect(result).toMatchInlineSnapshot(`""quoted string""`);
        });

        it("should handle single quotes", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("'single quoted'");
            expect(result).toMatchInlineSnapshot(`"'single quoted'"`);
        });

        it("should handle backticks", () => {
            const result = LiteralEnumGenerator.sanitizeLiteralValue("`backticked`");
            expect(result).toMatchInlineSnapshot(`"\`backticked\`"`);
        });
    });
});
