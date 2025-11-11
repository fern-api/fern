import { camelCase, hash, uniqueId, upperFirst } from "../text";

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

    describe("hash", () => {
        describe("basic hashing", () => {
            it("should generate a hash from a string", () => {
                const result = hash("hello");
                expect(typeof result).toBe("number");
            });

            it("should generate different hashes for different strings", () => {
                const hash1 = hash("hello");
                const hash2 = hash("world");
                const hash3 = hash("foo");

                expect(hash1).not.toBe(hash2);
                expect(hash2).not.toBe(hash3);
                expect(hash1).not.toBe(hash3);
            });

            it("should generate the same hash for the same string", () => {
                const hash1 = hash("hello");
                const hash2 = hash("hello");
                const hash3 = hash("hello");

                expect(hash1).toBe(hash2);
                expect(hash2).toBe(hash3);
            });

            it("should handle empty strings", () => {
                const result = hash("");
                expect(typeof result).toBe("number");
                expect(result).toBe(0);
            });
        });

        describe("edge cases", () => {
            it("should handle single characters", () => {
                const hash1 = hash("a");
                const hash2 = hash("b");
                const hash3 = hash("z");

                expect(typeof hash1).toBe("number");
                expect(typeof hash2).toBe("number");
                expect(typeof hash3).toBe("number");
                expect(hash1).not.toBe(hash2);
                expect(hash2).not.toBe(hash3);
            });

            it("should be case sensitive", () => {
                const hash1 = hash("hello");
                const hash2 = hash("Hello");
                const hash3 = hash("HELLO");

                expect(hash1).not.toBe(hash2);
                expect(hash2).not.toBe(hash3);
                expect(hash1).not.toBe(hash3);
            });

            it("should handle special characters", () => {
                const hash1 = hash("hello!");
                const hash2 = hash("hello@");
                const hash3 = hash("hello#");

                expect(hash1).not.toBe(hash2);
                expect(hash2).not.toBe(hash3);
                expect(hash1).not.toBe(hash3);
            });

            it("should handle numbers", () => {
                const hash1 = hash("123");
                const hash2 = hash("456");
                const hash3 = hash("789");

                expect(hash1).not.toBe(hash2);
                expect(hash2).not.toBe(hash3);
            });

            it("should handle whitespace", () => {
                const hash1 = hash("hello world");
                const hash2 = hash("hello  world");
                const hash3 = hash("helloworld");

                expect(hash1).not.toBe(hash2);
                expect(hash1).not.toBe(hash3);
                expect(hash2).not.toBe(hash3);
            });

            it("should handle unicode characters", () => {
                const hash1 = hash("café");
                const hash2 = hash("naïve");
                const hash3 = hash("über");

                expect(typeof hash1).toBe("number");
                expect(typeof hash2).toBe("number");
                expect(typeof hash3).toBe("number");
                expect(hash1).not.toBe(hash2);
                expect(hash2).not.toBe(hash3);
            });

            it("should handle emojis", () => {
                const hash1 = hash("hello 👋");
                const hash2 = hash("world 🌍");

                expect(typeof hash1).toBe("number");
                expect(typeof hash2).toBe("number");
                expect(hash1).not.toBe(hash2);
            });
        });

        describe("real-world usage", () => {
            it("should handle long strings", () => {
                const longString = "The quick brown fox jumps over the lazy dog. ".repeat(10);
                const result = hash(longString);

                expect(typeof result).toBe("number");
            });

            it("should handle repeated substrings differently", () => {
                const hash1 = hash("aaaa");
                const hash2 = hash("bbbb");
                const hash3 = hash("aaab");

                expect(hash1).not.toBe(hash2);
                expect(hash1).not.toBe(hash3);
                expect(hash2).not.toBe(hash3);
            });

            it("should be deterministic across multiple runs", () => {
                const testString = "test string for determinism";
                const results = [];

                for (let i = 0; i < 100; i++) {
                    results.push(hash(testString));
                }

                // All results should be the same
                expect(new Set(results).size).toBe(1);
            });
        });
    });

    describe("uniqueId", () => {
        describe("basic functionality", () => {
            it("should generate a UUID-like string", () => {
                const result = uniqueId("hello");
                expect(typeof result).toBe("string");
                expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            });

            it("should generate the same ID for the same input", () => {
                const id1 = uniqueId("hello");
                const id2 = uniqueId("hello");
                const id3 = uniqueId("hello");

                expect(id1).toBe(id2);
                expect(id2).toBe(id3);
            });

            it("should generate different IDs for different inputs", () => {
                const id1 = uniqueId("hello");
                const id2 = uniqueId("world");
                const id3 = uniqueId("foo");

                expect(id1).not.toBe(id2);
                expect(id2).not.toBe(id3);
                expect(id1).not.toBe(id3);
            });

            it("should handle empty strings", () => {
                const result = uniqueId("");
                expect(typeof result).toBe("string");
                expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            });

            it("should follow UUID v4 format", () => {
                const result = uniqueId("test");
                const parts = result.split("-");

                expect(parts).toHaveLength(5);
                expect(parts[0]).toHaveLength(8);
                expect(parts[1]).toHaveLength(4);
                expect(parts[2]).toHaveLength(4);
                expect(parts[3]).toHaveLength(4);
                expect(parts[4]).toHaveLength(12);

                // UUID v4 has a '4' at the beginning of the third group
                expect(parts[2]?.[0]).toBe("4");

                // UUID v4 has specific bits in the fourth group (8, 9, a, or b)
                expect(["8", "9", "a", "b"]).toContain(parts[3]?.[0]);
            });
        });

        describe("edge cases", () => {
            it("should handle single characters", () => {
                const id1 = uniqueId("a");
                const id2 = uniqueId("b");
                const id3 = uniqueId("z");

                expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id3).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id1).not.toBe(id2);
                expect(id2).not.toBe(id3);
            });

            it("should be case sensitive", () => {
                const id1 = uniqueId("hello");
                const id2 = uniqueId("Hello");
                const id3 = uniqueId("HELLO");

                expect(id1).not.toBe(id2);
                expect(id2).not.toBe(id3);
                expect(id1).not.toBe(id3);
            });

            it("should handle special characters", () => {
                const id1 = uniqueId("hello!");
                const id2 = uniqueId("hello@");
                const id3 = uniqueId("hello#");

                expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id1).not.toBe(id2);
                expect(id2).not.toBe(id3);
            });

            it("should handle numbers", () => {
                const id1 = uniqueId("123");
                const id2 = uniqueId("456");
                const id3 = uniqueId("789");

                expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id1).not.toBe(id2);
                expect(id2).not.toBe(id3);
            });

            it("should handle whitespace", () => {
                const id1 = uniqueId("hello world");
                const id2 = uniqueId("hello  world");
                const id3 = uniqueId("helloworld");

                expect(id1).not.toBe(id2);
                expect(id1).not.toBe(id3);
                expect(id2).not.toBe(id3);
            });

            it("should handle unicode characters", () => {
                const id1 = uniqueId("café");
                const id2 = uniqueId("naïve");
                const id3 = uniqueId("über");

                expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id3).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id1).not.toBe(id2);
                expect(id2).not.toBe(id3);
            });

            it("should handle emojis", () => {
                const id1 = uniqueId("hello 👋");
                const id2 = uniqueId("world 🌍");

                expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id1).not.toBe(id2);
            });
        });

        describe("determinism and consistency", () => {
            it("should be deterministic across multiple runs", () => {
                const testString = "test string for determinism";
                const results = [];

                for (let i = 0; i < 100; i++) {
                    results.push(uniqueId(testString));
                }

                // All results should be the same
                expect(new Set(results).size).toBe(1);
            });

            it("should generate consistent IDs for long strings", () => {
                const longString = "The quick brown fox jumps over the lazy dog. ".repeat(10);
                const id1 = uniqueId(longString);
                const id2 = uniqueId(longString);

                expect(id1).toBe(id2);
                expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            });

            it("should handle similar but different strings", () => {
                const id1 = uniqueId("test");
                const id2 = uniqueId("test ");
                const id3 = uniqueId("test1");
                const id4 = uniqueId("Test");

                expect(id1).not.toBe(id2);
                expect(id1).not.toBe(id3);
                expect(id1).not.toBe(id4);
                expect(id2).not.toBe(id3);
                expect(id2).not.toBe(id4);
                expect(id3).not.toBe(id4);
            });
        });

        describe("real-world usage", () => {
            it("should generate unique IDs for typical use cases", () => {
                const inputs = [
                    "user-123",
                    "session-abc-def",
                    "transaction-2024-01-01",
                    "order-item-456",
                    "product-sku-789"
                ];

                const ids = inputs.map((input) => uniqueId(input));

                // All IDs should be unique
                expect(new Set(ids).size).toBe(ids.length);

                // All IDs should be valid UUID v4 format
                ids.forEach((id) => {
                    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                });
            });

            it("should maintain consistency for repeated inputs in practical scenarios", () => {
                const userId = "user-12345";
                const sessionId = "session-abcde";

                // Generate IDs multiple times
                const userIds = Array(10)
                    .fill(null)
                    .map(() => uniqueId(userId));
                const sessionIds = Array(10)
                    .fill(null)
                    .map(() => uniqueId(sessionId));

                // All user IDs should be the same
                expect(new Set(userIds).size).toBe(1);

                // All session IDs should be the same
                expect(new Set(sessionIds).size).toBe(1);

                // But user and session IDs should be different
                expect(userIds[0]).not.toBe(sessionIds[0]);
            });

            it("should generate valid IDs for paths and URLs", () => {
                const id1 = uniqueId("/api/users/123");
                const id2 = uniqueId("https://example.com/resource");
                const id3 = uniqueId("file:///path/to/file.txt");

                expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id3).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                expect(id1).not.toBe(id2);
                expect(id2).not.toBe(id3);
            });
        });

        describe("collision resistance", () => {
            it("should generate different IDs for a large set of inputs", () => {
                const ids = new Set<string>();
                const numInputs = 1000;

                for (let i = 0; i < numInputs; i++) {
                    const id = uniqueId(`input-${i}`);
                    ids.add(id);
                }

                // All IDs should be unique (no collisions)
                expect(ids.size).toBe(numInputs);
            });

            it("should generate different IDs for inputs that differ by one character", () => {
                const ids = [];
                const baseString = "test-string";

                for (let i = 0; i < 26; i++) {
                    const char = String.fromCharCode(97 + i); // a-z
                    ids.push(uniqueId(baseString + char));
                }

                // All IDs should be unique
                expect(new Set(ids).size).toBe(26);
            });
        });
    });
});
