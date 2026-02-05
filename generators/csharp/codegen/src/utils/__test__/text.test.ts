import { camelCase, hash, normalizeDates, uniqueId, upperFirst } from "../text";

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

    describe("normalizeDates", () => {
        describe("basic functionality", () => {
            it("should normalize date-time strings to full ISO format with timezone", () => {
                const result = normalizeDates("date", "2025-01-01T00:00:00.000Z");
                expect(result).toBe("2025-01-01T00:00:00.000Z");
            });

            it("should normalize ISO date-time strings without timezone to UTC", () => {
                // Without timezone, parsed as local time then converted to UTC
                const result = normalizeDates("date", "2025-01-01T00:00:00.000");
                expect(typeof result).toBe("string");
                expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            });

            it("should normalize ISO date-time strings without milliseconds", () => {
                const result = normalizeDates("date", "2025-01-01T00:00:00Z");
                expect(result).toBe("2025-01-01T00:00:00.000Z");
            });

            it("should normalize ISO date-time strings with positive timezone offset", () => {
                const result = normalizeDates("date", "2025-01-01T00:00:00.000+05:00");
                // Should convert to UTC
                expect(result).toBe("2024-12-31T19:00:00.000Z");
            });

            it("should normalize ISO date-time strings with negative timezone offset", () => {
                const result = normalizeDates("date", "2025-01-01T00:00:00.000-05:00");
                // Should convert to UTC
                expect(result).toBe("2025-01-01T05:00:00.000Z");
            });

            it("should normalize date-only strings to YYYY-MM-DD format", () => {
                // Date-only strings now correctly match the date-only regex
                const result = normalizeDates("date", "2025-01-01");
                expect(result).toBe("2025-01-01");
            });

            it("should handle date strings with single-digit month and day", () => {
                const result = normalizeDates("date", "2025-1-5");
                expect(result).toBe("2025-01-05");
            });

            it("should not match year-only strings", () => {
                // Year-only strings no longer match the date regex
                const result = normalizeDates("date", "2025");
                expect(result).toBe("2025");
            });

            it("should return non-date values unchanged", () => {
                expect(normalizeDates("key", "not a date")).toBe("not a date");
                expect(normalizeDates("key", 123)).toBe(123);
                expect(normalizeDates("key", true)).toBe(true);
                expect(normalizeDates("key", false)).toBe(false);
                expect(normalizeDates("key", null)).toBe(null);
                expect(normalizeDates("key", undefined)).toBe(undefined);
            });
        });

        describe("with JSON.stringify", () => {
            it("should work as a replacer function for JSON.stringify with UTC times", () => {
                const obj = {
                    date: "2025-01-01T00:00:00.000Z",
                    name: "test"
                };

                const result = JSON.stringify(obj, normalizeDates);
                const parsed = JSON.parse(result);

                expect(parsed.date).toBe("2025-01-01T00:00:00.000Z");
                expect(parsed.name).toBe("test");
            });

            it("should normalize multiple date strings in an object", () => {
                const obj = {
                    createdAt: "2025-01-01T00:00:00.000Z",
                    updatedAt: "2025-01-02T12:30:00.000Z",
                    name: "test"
                };

                const result = JSON.stringify(obj, normalizeDates);
                const parsed = JSON.parse(result);

                expect(parsed.createdAt).toBe("2025-01-01T00:00:00.000Z");
                expect(parsed.updatedAt).toBe("2025-01-02T12:30:00.000Z");
                expect(parsed.name).toBe("test");
            });

            it("should normalize dates in nested objects", () => {
                const obj = {
                    user: {
                        createdAt: "2025-01-01T00:00:00.000Z",
                        profile: {
                            updatedAt: "2025-01-02T12:30:00.000Z"
                        }
                    }
                };

                const result = JSON.stringify(obj, normalizeDates);
                const parsed = JSON.parse(result);

                expect(parsed.user.createdAt).toBe("2025-01-01T00:00:00.000Z");
                expect(parsed.user.profile.updatedAt).toBe("2025-01-02T12:30:00.000Z");
            });

            it("should normalize dates in arrays", () => {
                const obj = {
                    dates: ["2025-01-01T00:00:00.000Z", "2025-01-02T00:00:00.000Z", "2025-01-03T00:00:00.000Z"]
                };

                const result = JSON.stringify(obj, normalizeDates);
                const parsed = JSON.parse(result);

                expect(parsed.dates[0]).toBe("2025-01-01T00:00:00.000Z");
                expect(parsed.dates[1]).toBe("2025-01-02T00:00:00.000Z");
                expect(parsed.dates[2]).toBe("2025-01-03T00:00:00.000Z");
            });

            it("should handle mixed types in arrays", () => {
                const obj = {
                    values: ["2025-01-01T00:00:00.000Z", "not a date", 123, true, null]
                };

                const result = JSON.stringify(obj, normalizeDates);
                const parsed = JSON.parse(result);

                expect(parsed.values[0]).toBe("2025-01-01T00:00:00.000Z");
                expect(parsed.values[1]).toBe("not a date");
                expect(parsed.values[2]).toBe(123);
                expect(parsed.values[3]).toBe(true);
                expect(parsed.values[4]).toBe(null);
            });
        });

        describe("date format variations", () => {
            it("should normalize date-only ISO strings to YYYY-MM-DD", () => {
                const result = normalizeDates("date", "2025-01-01");
                expect(result).toBe("2025-01-01");
            });

            it("should normalize dates with space instead of T separator", () => {
                // Space separator is treated as local time
                const result = normalizeDates("date", "2025-01-01 00:00:00Z");
                expect(result).toBe("2025-01-01T00:00:00.000Z");
            });

            it("should normalize dates with lowercase z timezone", () => {
                const result = normalizeDates("date", "2025-01-01T00:00:00.000z");
                expect(result).toBe("2025-01-01T00:00:00.000Z");
            });

            it("should handle dates with high precision milliseconds", () => {
                const result = normalizeDates("date", "2025-01-01T00:00:00.123456Z");
                // JavaScript Date will truncate to milliseconds
                expect(result).toBe("2025-01-01T00:00:00.123Z");
            });

            it("should handle week date format", () => {
                // ISO week date format: YYYY-Www-D
                // JavaScript's Date constructor may not support this, so expect a non-datetime string
                const result = normalizeDates("date", "2025-W01-1");
                expect(result).toBe("2025-W01-1");
            });

            it("should handle ordinal date format", () => {
                // ISO ordinal date format: YYYY-DDD
                // No longer matches the date-only regex, so returned unchanged
                const result = normalizeDates("date", "2025-001");
                expect(result).toBe("2025-001");
            });
        });

        describe("edge cases", () => {
            it("should handle date-times at boundaries", () => {
                // Start of epoch
                const epoch = normalizeDates("date", "1970-01-01T00:00:00.000Z");
                expect(epoch).toBe("1970-01-01T00:00:00.000Z");

                // End of year
                const endOfYear = normalizeDates("date", "2025-12-31T23:59:59.999Z");
                expect(endOfYear).toBe("2025-12-31T23:59:59.999Z");

                // Leap year date
                const leapDay = normalizeDates("date", "2024-02-29T00:00:00.000Z");
                expect(leapDay).toBe("2024-02-29T00:00:00.000Z");
            });

            it("should handle date-only at boundaries", () => {
                // Start of epoch date
                const epoch = normalizeDates("date", "1970-01-01");
                expect(epoch).toBe("1970-01-01");

                // End of year
                const endOfYear = normalizeDates("date", "2025-12-31");
                expect(endOfYear).toBe("2025-12-31");

                // Leap year date
                const leapDay = normalizeDates("date", "2024-02-29");
                expect(leapDay).toBe("2024-02-29");
            });

            it("should handle dates with year < 1000", () => {
                const result = normalizeDates("date", "0999-01-01T00:00:00.000Z");
                expect(result).toBe("0999-01-01T00:00:00.000Z");

                const dateOnly = normalizeDates("date", "0999-01-01");
                expect(dateOnly).toBe("0999-01-01");
            });

            it("should handle dates with negative years (BC)", () => {
                const result = normalizeDates("date", "-000001-01-01T00:00:00.000Z");
                expect(typeof result).toBe("string");
                // JavaScript Date handles negative years
                expect(result).toContain("01-01T00:00:00");
            });

            it("should handle dates with year > 9999", () => {
                const result = normalizeDates("date", "+010000-01-01T00:00:00.000Z");
                expect(typeof result).toBe("string");
                // JavaScript Date can handle extended year format
                expect(result).toContain("01-01T00:00:00");
            });

            it("should not modify strings that look like dates but aren't ISO format", () => {
                expect(normalizeDates("date", "01/01/2025")).toBe("01/01/2025");
                expect(normalizeDates("date", "January 1, 2025")).toBe("January 1, 2025");
                expect(normalizeDates("date", "12:00:00")).toBe("12:00:00");
            });

            it("should handle empty strings", () => {
                const result = normalizeDates("date", "");
                expect(result).toBe("");
            });

            it("should handle objects", () => {
                const obj = { date: "2025-01-01" };
                const result = normalizeDates("date", obj);
                expect(result).toBe(obj);
            });

            it("should handle arrays", () => {
                const arr = ["2025-01-01"];
                const result = normalizeDates("date", arr);
                expect(result).toBe(arr);
            });
        });

        describe("wire test use case", () => {
            it("should enable consistent date-time matching in wire tests", () => {
                // Simulating comparing two API responses with date-time
                const response1 = {
                    id: "123",
                    createdAt: "2025-01-01T00:00:00.000Z",
                    data: "test"
                };

                const response2 = {
                    id: "123",
                    createdAt: "2025-01-01T00:00:00.000Z", // Already in ISO format
                    data: "test"
                };

                // Normalize both
                const normalized1 = JSON.parse(JSON.stringify(response1, normalizeDates));
                const normalized2 = JSON.parse(JSON.stringify(response2, normalizeDates));

                // Should be equal after normalization
                expect(normalized1.createdAt).toBe(normalized2.createdAt);
                expect(JSON.stringify(normalized1)).toBe(JSON.stringify(normalized2));
            });

            it("should enable consistent date-only matching in wire tests", () => {
                // Simulating comparing two API responses with date-only
                const response1 = {
                    id: "123",
                    birthDate: "2025-01-01",
                    data: "test"
                };

                const response2 = {
                    id: "123",
                    birthDate: "2025-01-01", // Same format
                    data: "test"
                };

                // Normalize both
                const normalized1 = JSON.parse(JSON.stringify(response1, normalizeDates));
                const normalized2 = JSON.parse(JSON.stringify(response2, normalizeDates));

                // Should be equal after normalization
                expect(normalized1.birthDate).toBe(normalized2.birthDate);
                expect(JSON.stringify(normalized1)).toBe(JSON.stringify(normalized2));
            });

            it("should handle timezone differences in wire tests", () => {
                // Same moment in time, different representations
                const response1 = {
                    timestamp: "2025-01-01T00:00:00.000Z"
                };

                const response2 = {
                    timestamp: "2025-01-01T05:00:00.000+05:00"
                };

                // Normalize both
                const normalized1 = JSON.parse(JSON.stringify(response1, normalizeDates));
                const normalized2 = JSON.parse(JSON.stringify(response2, normalizeDates));

                // Should be equal after normalization (same UTC time)
                expect(normalized1.timestamp).toBe(normalized2.timestamp);
            });

            it("should preserve non-date fields in wire test comparisons", () => {
                const response = {
                    id: "abc-123",
                    name: "Test User",
                    email: "test@example.com",
                    age: 30,
                    active: true,
                    metadata: null,
                    createdAt: "2025-01-01T00:00:00.000Z",
                    birthDate: "1995-05-15"
                };

                const normalized = JSON.parse(JSON.stringify(response, normalizeDates));

                expect(normalized.id).toBe("abc-123");
                expect(normalized.name).toBe("Test User");
                expect(normalized.email).toBe("test@example.com");
                expect(normalized.age).toBe(30);
                expect(normalized.active).toBe(true);
                expect(normalized.metadata).toBe(null);
                expect(normalized.createdAt).toBe("2025-01-01T00:00:00.000Z");
                expect(normalized.birthDate).toBe("1995-05-15");
            });

            it("should work with deeply nested wire test data", () => {
                const response = {
                    user: {
                        id: "123",
                        profile: {
                            createdAt: "2025-01-01T00:00:00.000Z",
                            birthDate: "1990-01-01",
                            settings: {
                                lastLogin: "2025-01-15T12:30:00.000Z"
                            }
                        },
                        posts: [
                            {
                                id: "post1",
                                publishedAt: "2025-01-10T00:00:00.000Z",
                                scheduledDate: "2025-01-20"
                            },
                            {
                                id: "post2",
                                publishedAt: "2025-01-11T00:00:00.000Z",
                                scheduledDate: "2025-01-21"
                            }
                        ]
                    }
                };

                const normalized = JSON.parse(JSON.stringify(response, normalizeDates));

                expect(normalized.user.profile.createdAt).toBe("2025-01-01T00:00:00.000Z");
                expect(normalized.user.profile.birthDate).toBe("1990-01-01");
                expect(normalized.user.profile.settings.lastLogin).toBe("2025-01-15T12:30:00.000Z");
                expect(normalized.user.posts[0].publishedAt).toBe("2025-01-10T00:00:00.000Z");
                expect(normalized.user.posts[0].scheduledDate).toBe("2025-01-20");
                expect(normalized.user.posts[1].publishedAt).toBe("2025-01-11T00:00:00.000Z");
                expect(normalized.user.posts[1].scheduledDate).toBe("2025-01-21");
            });
        });

        describe("key parameter", () => {
            it("should receive the key when used as a replacer", () => {
                const keys: string[] = [];
                const customReplacer = (key: string, value: unknown) => {
                    keys.push(key);
                    return normalizeDates(key, value);
                };

                const obj = {
                    date: "2025-01-01T00:00:00.000Z",
                    name: "test"
                };

                JSON.stringify(obj, customReplacer);

                // First call has empty string key for root
                expect(keys).toContain("");
                expect(keys).toContain("date");
                expect(keys).toContain("name");
            });

            it("should work regardless of key name", () => {
                const obj = {
                    createdAt: "2025-01-01T00:00:00.000Z",
                    timestamp: "2025-01-02T00:00:00.000Z",
                    date: "2025-01-03"
                };

                const normalized = JSON.parse(JSON.stringify(obj, normalizeDates));

                // Function should normalize based on value, not key
                expect(normalized.createdAt).toBe("2025-01-01T00:00:00.000Z");
                expect(normalized.timestamp).toBe("2025-01-02T00:00:00.000Z");
                expect(normalized.date).toBe("2025-01-03");
            });
        });

        describe("real-world date scenarios", () => {
            it("should normalize various real-world date-time formats with UTC", () => {
                // Common ISO 8601 variants used in APIs with UTC timezone
                const dates = [
                    { input: "2025-11-07T12:34:56.789Z", expected: "2025-11-07T12:34:56.789Z" },
                    { input: "2025-11-07T12:34:56Z", expected: "2025-11-07T12:34:56.000Z" }
                ];

                dates.forEach(({ input, expected }) => {
                    const result = normalizeDates("date", input);
                    expect(result).toBe(expected);
                });
            });

            it("should normalize date-time formats without timezone (local time)", () => {
                // Without timezone, these are parsed as local time
                const result1 = normalizeDates("date", "2025-11-07T12:34:56");
                expect(typeof result1).toBe("string");
                expect(result1).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            });

            it("should normalize various real-world date-only formats", () => {
                // Common date-only formats
                const result1 = normalizeDates("date", "2025-11-07");
                expect(typeof result1).toBe("string");
                expect(result1).toBe("2025-11-07");

                // Single-digit month and day
                const result2 = normalizeDates("date", "2025-1-7");
                expect(typeof result2).toBe("string");
                expect(result2).toBe("2025-01-07");
            });

            it("should handle database timestamp formats", () => {
                // Common database timestamp formats with UTC
                const result1 = normalizeDates("created_at", "2025-11-07T12:34:56.789Z");
                expect(result1).toBe("2025-11-07T12:34:56.789Z");

                const result2 = normalizeDates("updated_at", "2025-11-07T12:34:56.789000Z");
                // JavaScript truncates extra precision
                expect(result2).toBe("2025-11-07T12:34:56.789Z");
            });

            it("should handle API response with mixed date formats", () => {
                const apiResponse = {
                    id: "user-123",
                    email: "user@example.com",
                    createdAt: "2025-01-01T00:00:00.000Z",
                    updatedAt: "2025-01-15T10:30:00.000Z",
                    lastLogin: "2025-11-07T12:34:56+00:00",
                    birthDate: "1990-01-01",
                    metadata: {
                        registrationDate: "2025-01-01",
                        verifiedAt: "2025-01-02T08:00:00.000Z"
                    }
                };

                const normalized = JSON.parse(JSON.stringify(apiResponse, normalizeDates));

                expect(normalized.createdAt).toBe("2025-01-01T00:00:00.000Z");
                expect(normalized.updatedAt).toBe("2025-01-15T10:30:00.000Z");
                expect(normalized.lastLogin).toBe("2025-11-07T12:34:56.000Z");
                expect(normalized.birthDate).toBe("1990-01-01");
                expect(normalized.metadata.registrationDate).toBe("2025-01-01");
                expect(normalized.metadata.verifiedAt).toBe("2025-01-02T08:00:00.000Z");
            });
        });
    });
});
