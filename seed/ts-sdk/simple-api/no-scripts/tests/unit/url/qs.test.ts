import { toQueryString } from "../../../src/core/url/index";

describe("Test qs toQueryString", () => {
    interface BasicTestCase {
        description: string;
        input: any;
        expected: string;
    }

    describe("Basic functionality", () => {
        const basicTests: BasicTestCase[] = [
            { description: "should return empty string for null", input: null, expected: "" },
            { description: "should return empty string for undefined", input: undefined, expected: "" },
            { description: "should return empty string for string primitive", input: "hello", expected: "" },
            { description: "should return empty string for number primitive", input: 42, expected: "" },
            { description: "should return empty string for true boolean", input: true, expected: "" },
            { description: "should return empty string for false boolean", input: false, expected: "" },
            { description: "should handle empty objects", input: {}, expected: "" },
            {
                description: "should handle simple key-value pairs",
                input: { name: "John", age: 30 },
                expected: "name=John&age=30",
            },
        ];

        basicTests.forEach(({ description, input, expected }) => {
            it(description, () => {
                expect(toQueryString(input)).toBe(expected);
            });
        });
    });

    describe("Array handling", () => {
        interface ArrayTestCase {
            description: string;
            input: any;
            options?: { arrayFormat?: "repeat" | "indices" };
            expected: string;
        }

        const arrayTests: ArrayTestCase[] = [
            {
                description: "should handle arrays with indices format (default)",
                input: { items: ["a", "b", "c"] },
                expected: "items%5B0%5D=a&items%5B1%5D=b&items%5B2%5D=c",
            },
            {
                description: "should handle arrays with repeat format",
                input: { items: ["a", "b", "c"] },
                options: { arrayFormat: "repeat" },
                expected: "items=a&items=b&items=c",
            },
            {
                description: "should handle empty arrays",
                input: { items: [] },
                expected: "",
            },
            {
                description: "should handle arrays with mixed types",
                input: { mixed: ["string", 42, true, false] },
                expected: "mixed%5B0%5D=string&mixed%5B1%5D=42&mixed%5B2%5D=true&mixed%5B3%5D=false",
            },
            {
                description: "should handle arrays with objects",
                input: { users: [{ name: "John" }, { name: "Jane" }] },
                expected: "users%5B0%5D%5Bname%5D=John&users%5B1%5D%5Bname%5D=Jane",
            },
            {
                description: "should handle arrays with objects in repeat format",
                input: { users: [{ name: "John" }, { name: "Jane" }] },
                options: { arrayFormat: "repeat" },
                expected: "users%5Bname%5D=John&users%5Bname%5D=Jane",
            },
        ];

        arrayTests.forEach(({ description, input, options, expected }) => {
            it(description, () => {
                expect(toQueryString(input, options)).toBe(expected);
            });
        });
    });

    describe("Nested objects", () => {
        const nestedTests: BasicTestCase[] = [
            {
                description: "should handle nested objects",
                input: { user: { name: "John", age: 30 } },
                expected: "user%5Bname%5D=John&user%5Bage%5D=30",
            },
            {
                description: "should handle deeply nested objects",
                input: { user: { profile: { name: "John", settings: { theme: "dark" } } } },
                expected: "user%5Bprofile%5D%5Bname%5D=John&user%5Bprofile%5D%5Bsettings%5D%5Btheme%5D=dark",
            },
            {
                description: "should handle empty nested objects",
                input: { user: {} },
                expected: "",
            },
        ];

        nestedTests.forEach(({ description, input, expected }) => {
            it(description, () => {
                expect(toQueryString(input)).toBe(expected);
            });
        });
    });

    describe("Encoding", () => {
        interface EncodingTestCase {
            description: string;
            input: any;
            options?: { encode?: boolean };
            expected: string;
        }

        const encodingTests: EncodingTestCase[] = [
            {
                description: "should encode by default",
                input: { name: "John Doe", email: "john@example.com" },
                expected: "name=John%20Doe&email=john%40example.com",
            },
            {
                description: "should not encode when encode is false",
                input: { name: "John Doe", email: "john@example.com" },
                options: { encode: false },
                expected: "name=John Doe&email=john@example.com",
            },
            {
                description: "should encode special characters in keys",
                input: { "user name": "John", "email[primary]": "john@example.com" },
                expected: "user%20name=John&email%5Bprimary%5D=john%40example.com",
            },
            {
                description: "should not encode special characters in keys when encode is false",
                input: { "user name": "John", "email[primary]": "john@example.com" },
                options: { encode: false },
                expected: "user name=John&email[primary]=john@example.com",
            },
        ];

        encodingTests.forEach(({ description, input, options, expected }) => {
            it(description, () => {
                expect(toQueryString(input, options)).toBe(expected);
            });
        });
    });

    describe("Mixed scenarios", () => {
        interface MixedTestCase {
            description: string;
            input: any;
            options?: { arrayFormat?: "repeat" | "indices" };
            expected: string;
        }

        const mixedTests: MixedTestCase[] = [
            {
                description: "should handle complex nested structures",
                input: {
                    filters: {
                        status: ["active", "pending"],
                        category: {
                            type: "electronics",
                            subcategories: ["phones", "laptops"],
                        },
                    },
                    sort: { field: "name", direction: "asc" },
                },
                expected:
                    "filters%5Bstatus%5D%5B0%5D=active&filters%5Bstatus%5D%5B1%5D=pending&filters%5Bcategory%5D%5Btype%5D=electronics&filters%5Bcategory%5D%5Bsubcategories%5D%5B0%5D=phones&filters%5Bcategory%5D%5Bsubcategories%5D%5B1%5D=laptops&sort%5Bfield%5D=name&sort%5Bdirection%5D=asc",
            },
            {
                description: "should handle complex nested structures with repeat format",
                input: {
                    filters: {
                        status: ["active", "pending"],
                        category: {
                            type: "electronics",
                            subcategories: ["phones", "laptops"],
                        },
                    },
                    sort: { field: "name", direction: "asc" },
                },
                options: { arrayFormat: "repeat" },
                expected:
                    "filters%5Bstatus%5D=active&filters%5Bstatus%5D=pending&filters%5Bcategory%5D%5Btype%5D=electronics&filters%5Bcategory%5D%5Bsubcategories%5D=phones&filters%5Bcategory%5D%5Bsubcategories%5D=laptops&sort%5Bfield%5D=name&sort%5Bdirection%5D=asc",
            },
            {
                description: "should handle arrays with null/undefined values",
                input: { items: ["a", null, "c", undefined, "e"] },
                expected: "items%5B0%5D=a&items%5B1%5D=&items%5B2%5D=c&items%5B4%5D=e",
            },
            {
                description: "should handle objects with null/undefined values",
                input: { name: "John", age: null, email: undefined, active: true },
                expected: "name=John&age=&active=true",
            },
        ];

        mixedTests.forEach(({ description, input, options, expected }) => {
            it(description, () => {
                expect(toQueryString(input, options)).toBe(expected);
            });
        });
    });

    describe("Edge cases", () => {
        const edgeCaseTests: BasicTestCase[] = [
            {
                description: "should handle numeric keys",
                input: { "0": "zero", "1": "one" },
                expected: "0=zero&1=one",
            },
            {
                description: "should handle boolean values in objects",
                input: { enabled: true, disabled: false },
                expected: "enabled=true&disabled=false",
            },
            {
                description: "should handle empty strings",
                input: { name: "", description: "test" },
                expected: "name=&description=test",
            },
            {
                description: "should handle zero values",
                input: { count: 0, price: 0.0 },
                expected: "count=0&price=0",
            },
            {
                description: "should handle arrays with empty strings",
                input: { items: ["a", "", "c"] },
                expected: "items%5B0%5D=a&items%5B1%5D=&items%5B2%5D=c",
            },
        ];

        edgeCaseTests.forEach(({ description, input, expected }) => {
            it(description, () => {
                expect(toQueryString(input)).toBe(expected);
            });
        });
    });

    describe("Options combinations", () => {
        interface OptionsTestCase {
            description: string;
            input: any;
            options?: { arrayFormat?: "repeat" | "indices"; encode?: boolean };
            expected: string;
        }

        const optionsTests: OptionsTestCase[] = [
            {
                description: "should respect both arrayFormat and encode options",
                input: { items: ["a & b", "c & d"] },
                options: { arrayFormat: "repeat", encode: false },
                expected: "items=a & b&items=c & d",
            },
            {
                description: "should use default options when none provided",
                input: { items: ["a", "b"] },
                expected: "items%5B0%5D=a&items%5B1%5D=b",
            },
            {
                description: "should merge provided options with defaults",
                input: { items: ["a", "b"], name: "John Doe" },
                options: { encode: false },
                expected: "items[0]=a&items[1]=b&name=John Doe",
            },
        ];

        optionsTests.forEach(({ description, input, options, expected }) => {
            it(description, () => {
                expect(toQueryString(input, options)).toBe(expected);
            });
        });
    });
});
