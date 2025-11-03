import { camelCase, upperFirst } from "../text";

describe("text utilities", () => {
    describe("upperFirst", () => {
        it("should capitalize the first letter of a string", () => {
            expect(upperFirst("hello")).toBe("Hello");
            expect(upperFirst("world")).toBe("World");
            expect(upperFirst("test")).toBe("Test");
        });

        it("should handle already capitalized strings", () => {
            expect(upperFirst("Hello")).toBe("Hello");
            expect(upperFirst("WORLD")).toBe("WORLD");
        });

        it("should handle single character strings", () => {
            expect(upperFirst("a")).toBe("A");
            expect(upperFirst("Z")).toBe("Z");
            expect(upperFirst("1")).toBe("1");
        });

        it("should handle empty strings", () => {
            expect(upperFirst("")).toBe("");
        });

        it("should only affect the first character", () => {
            expect(upperFirst("hELLO")).toBe("HELLO");
            expect(upperFirst("test case")).toBe("Test case");
            expect(upperFirst("mixedCase")).toBe("MixedCase");
        });

        it("should handle strings with numbers", () => {
            expect(upperFirst("123abc")).toBe("123abc");
            expect(upperFirst("test123")).toBe("Test123");
        });

        it("should handle strings with special characters", () => {
            expect(upperFirst("!hello")).toBe("!hello");
            expect(upperFirst("_test")).toBe("_test");
            expect(upperFirst("@symbol")).toBe("@symbol");
        });

        it("should handle strings with spaces", () => {
            expect(upperFirst(" hello")).toBe(" hello");
            expect(upperFirst("hello world")).toBe("Hello world");
        });

        it("should handle unicode characters", () => {
            expect(upperFirst("über")).toBe("Über");
            expect(upperFirst("école")).toBe("École");
            expect(upperFirst("hello 世界")).toBe("Hello 世界");
        });
    });

    describe("camelCase", () => {
        describe("basic conversions", () => {
            it("should convert simple words to camelCase", () => {
                expect(camelCase("hello")).toBe("hello");
                expect(camelCase("world")).toBe("world");
            });

            it("should convert space-separated words to camelCase", () => {
                expect(camelCase("hello world")).toBe("helloWorld");
                expect(camelCase("foo bar baz")).toBe("fooBarBaz");
                expect(camelCase("the quick brown fox")).toBe("theQuickBrownFox");
            });

            it("should convert hyphen-separated words to camelCase", () => {
                expect(camelCase("hello-world")).toBe("helloWorld");
                expect(camelCase("foo-bar-baz")).toBe("fooBarBaz");
                expect(camelCase("test-case-string")).toBe("testCaseString");
            });

            it("should convert underscore-separated words to camelCase", () => {
                expect(camelCase("hello_world")).toBe("helloWorld");
                expect(camelCase("foo_bar_baz")).toBe("fooBarBaz");
                expect(camelCase("snake_case_string")).toBe("snakeCaseString");
            });

            it("should convert mixed separators to camelCase", () => {
                expect(camelCase("hello-world_foo bar")).toBe("helloWorldFooBar");
                expect(camelCase("test_case-string foo")).toBe("testCaseStringFoo");
            });
        });

        describe("existing camelCase and PascalCase", () => {
            it("should convert existing camelCase to camelCase", () => {
                expect(camelCase("helloWorld")).toBe("helloWorld");
                expect(camelCase("fooBarBaz")).toBe("fooBarBaz");
            });

            it("should convert PascalCase to camelCase", () => {
                expect(camelCase("HelloWorld")).toBe("helloWorld");
                expect(camelCase("FooBarBaz")).toBe("fooBarBaz");
                expect(camelCase("TestCase")).toBe("testCase");
            });

            it("should handle mixed case transitions", () => {
                expect(camelCase("XMLParser")).toBe("xmlParser");
                expect(camelCase("HTMLElement")).toBe("htmlElement");
                expect(camelCase("IOError")).toBe("ioError");
            });

            it("should handle acronyms correctly", () => {
                expect(camelCase("XMLHttpRequest")).toBe("xmlHttpRequest");
                expect(camelCase("newHTMLParser")).toBe("newHtmlParser");
                expect(camelCase("APIKey")).toBe("apiKey");
            });
        });

        describe("edge cases", () => {
            it("should handle empty strings", () => {
                expect(camelCase("")).toBe("");
            });

            it("should handle single words", () => {
                expect(camelCase("test")).toBe("test");
                expect(camelCase("Test")).toBe("test");
                expect(camelCase("TEST")).toBe("test");
            });

            it("should handle single characters", () => {
                expect(camelCase("a")).toBe("a");
                expect(camelCase("A")).toBe("a");
                expect(camelCase("Z")).toBe("z");
            });

            it("should handle strings with leading/trailing whitespace", () => {
                expect(camelCase("  hello world  ")).toBe("helloWorld");
                expect(camelCase("\thello\t")).toBe("hello");
                expect(camelCase("\n\nhello world\n\n")).toBe("helloWorld");
            });

            it("should handle strings with multiple consecutive separators", () => {
                expect(camelCase("hello---world")).toBe("helloWorld");
                expect(camelCase("foo___bar")).toBe("fooBar");
                expect(camelCase("test   case")).toBe("testCase");
            });

            it("should handle strings with only separators", () => {
                expect(camelCase("---")).toBe("");
                expect(camelCase("___")).toBe("");
                expect(camelCase("   ")).toBe("");
            });

            it("should handle numbers", () => {
                expect(camelCase("test123")).toBe("test123");
                expect(camelCase("test 123")).toBe("test123");
                expect(camelCase("123test")).toBe("123test");
                expect(camelCase("foo2bar")).toBe("foo2bar");
            });

            it("should handle special characters", () => {
                expect(camelCase("hello@world")).toBe("hello@world");
                expect(camelCase("test!case")).toBe("test!case");
                expect(camelCase("foo#bar")).toBe("foo#bar");
            });
        });

        describe("real-world examples", () => {
            it("should convert database column names", () => {
                expect(camelCase("user_id")).toBe("userId");
                expect(camelCase("first_name")).toBe("firstName");
                expect(camelCase("created_at")).toBe("createdAt");
                expect(camelCase("is_active")).toBe("isActive");
            });

            it("should convert kebab-case identifiers", () => {
                expect(camelCase("background-color")).toBe("backgroundColor");
                expect(camelCase("font-size")).toBe("fontSize");
                expect(camelCase("z-index")).toBe("zIndex");
            });

            it("should convert human-readable strings", () => {
                expect(camelCase("First Name")).toBe("firstName");
                expect(camelCase("Last Name")).toBe("lastName");
                expect(camelCase("Email Address")).toBe("emailAddress");
                expect(camelCase("Phone Number")).toBe("phoneNumber");
            });

            it("should convert API endpoint names", () => {
                expect(camelCase("get-user-by-id")).toBe("getUserById");
                expect(camelCase("create_new_post")).toBe("createNewPost");
                expect(camelCase("delete item")).toBe("deleteItem");
            });

            it("should convert class/type names", () => {
                expect(camelCase("UserProfile")).toBe("userProfile");
                expect(camelCase("HTTPResponse")).toBe("httpResponse");
                expect(camelCase("JSONParser")).toBe("jsonParser");
            });
        });

        describe("complex case handling", () => {
            it("should handle mixed uppercase sequences", () => {
                expect(camelCase("HTTPSConnection")).toBe("httpsConnection");
                expect(camelCase("XMLHttpRequest")).toBe("xmlHttpRequest");
                expect(camelCase("IOStream")).toBe("ioStream");
            });

            it("should preserve numbers in the right position", () => {
                expect(camelCase("Base64Encoder")).toBe("base64encoder");
                expect(camelCase("UTF8String")).toBe("utf8string");
                expect(camelCase("SHA256Hash")).toBe("sha256hash");
            });

            it("should handle consecutive capitals followed by lowercase", () => {
                expect(camelCase("XMLParser")).toBe("xmlParser");
                expect(camelCase("HTMLElement")).toBe("htmlElement");
                expect(camelCase("PDFDocument")).toBe("pdfDocument");
            });
        });

        describe("unicode and international characters", () => {
            it("should handle unicode characters", () => {
                expect(camelCase("café")).toBe("café");
                expect(camelCase("naïve")).toBe("naïve");
            });

            it("should handle unicode with separators", () => {
                expect(camelCase("café_au_lait")).toBe("caféAuLait");
                expect(camelCase("über-cool")).toBe("überCool");
            });
        });

        describe("preserving existing format when appropriate", () => {
            it("should leave proper camelCase unchanged", () => {
                expect(camelCase("firstName")).toBe("firstName");
                expect(camelCase("backgroundColor")).toBe("backgroundColor");
                expect(camelCase("getElementById")).toBe("getElementById");
            });

            it("should convert improper camelCase correctly", () => {
                expect(camelCase("FirstName")).toBe("firstName"); // PascalCase -> camelCase
                expect(camelCase("fIRSTnAME")).toBe("fIrsTnAme"); // Weird case keeps weird transitions
            });
        });
    });
});
