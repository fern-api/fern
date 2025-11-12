import { assert, is } from "../type-guards";

describe("type-guards", () => {
    describe("primitive type guards", () => {
        describe("is.string", () => {
            it("should return true for strings", () => {
                expect(is.string("hello")).toBe(true);
                expect(is.string("")).toBe(true);
                expect(is.string("123")).toBe(true);
                expect(is.string(String("test"))).toBe(true);
            });

            it("should return false for non-strings", () => {
                expect(is.string(123)).toBe(false);
                expect(is.string(true)).toBe(false);
                expect(is.string(null)).toBe(false);
                expect(is.string(undefined)).toBe(false);
                expect(is.string({})).toBe(false);
                expect(is.string([])).toBe(false);
                expect(is.string(new Date())).toBe(false);
            });
        });

        describe("is.boolean", () => {
            it("should return true for booleans", () => {
                expect(is.boolean(true)).toBe(true);
                expect(is.boolean(false)).toBe(true);
                expect(is.boolean(Boolean(1))).toBe(true);
            });

            it("should return false for non-booleans", () => {
                expect(is.boolean("true")).toBe(false);
                expect(is.boolean(1)).toBe(false);
                expect(is.boolean(0)).toBe(false);
                expect(is.boolean(null)).toBe(false);
                expect(is.boolean(undefined)).toBe(false);
                expect(is.boolean({})).toBe(false);
            });
        });

        describe("is.number", () => {
            it("should return true for numbers", () => {
                expect(is.number(123)).toBe(true);
                expect(is.number(0)).toBe(true);
                expect(is.number(-456)).toBe(true);
                expect(is.number(3.14)).toBe(true);
                expect(is.number(Number.POSITIVE_INFINITY)).toBe(true);
                expect(is.number(Number.NEGATIVE_INFINITY)).toBe(true);
                expect(is.number(Number.NaN)).toBe(true);
            });

            it("should return false for non-numbers", () => {
                expect(is.number("123")).toBe(false);
                expect(is.number(true)).toBe(false);
                expect(is.number(null)).toBe(false);
                expect(is.number(undefined)).toBe(false);
                expect(is.number({})).toBe(false);
                expect(is.number([])).toBe(false);
            });
        });

        describe("is.date", () => {
            it("should return true for Date instances", () => {
                expect(is.date(new Date())).toBe(true);
                expect(is.date(new Date("2023-01-01"))).toBe(true);
                expect(is.date(new Date(0))).toBe(true);
            });

            it("should return false for non-Date values", () => {
                expect(is.date("2023-01-01")).toBe(false);
                expect(is.date(1234567890)).toBe(false);
                expect(is.date({})).toBe(false);
                expect(is.date(null)).toBe(false);
                expect(is.date(undefined)).toBe(false);
            });
        });

        describe("is.object", () => {
            it("should return true for objects", () => {
                expect(is.object({})).toBe(true);
                expect(is.object({ key: "value" })).toBe(true);
                expect(is.object(new Date())).toBe(true);
                expect(is.object(new Map())).toBe(true);
                expect(is.object(new Set())).toBe(true);
            });

            it("should return false for non-objects", () => {
                expect(is.object(null)).toBe(false);
                expect(is.object(undefined)).toBe(false);
                expect(is.object("string")).toBe(false);
                expect(is.object(123)).toBe(false);
                expect(is.object(true)).toBe(false);
            });

            it("should return false for arrays", () => {
                expect(is.object([])).toBe(false);
                expect(is.object([1, 2, 3])).toBe(false);
                expect(is.object(Array(5))).toBe(false);
            });
        });

        describe("is.array", () => {
            it("should return true for arrays", () => {
                expect(is.array([])).toBe(true);
                expect(is.array([1, 2, 3])).toBe(true);
                expect(is.array(["a", "b"])).toBe(true);
                expect(is.array(Array(5))).toBe(true);
                expect(is.array(new Array(10))).toBe(true);
            });

            it("should return false for non-arrays", () => {
                expect(is.array({})).toBe(false);
                expect(is.array("array")).toBe(false);
                expect(is.array(123)).toBe(false);
                expect(is.array(null)).toBe(false);
                expect(is.array(undefined)).toBe(false);
            });

            it("should return false for array-like objects", () => {
                expect(is.array({ length: 0 })).toBe(false);
                expect(is.array({ 0: "a", 1: "b", length: 2 })).toBe(false);
            });
        });
    });

    describe("custom type guards", () => {
        describe("is.NonNullable", () => {
            it("should return true for non-null and non-undefined values", () => {
                expect(is.NonNullable("string")).toBe(true);
                expect(is.NonNullable(123)).toBe(true);
                expect(is.NonNullable(0)).toBe(true);
                expect(is.NonNullable(false)).toBe(true);
                expect(is.NonNullable({})).toBe(true);
                expect(is.NonNullable([])).toBe(true);
                expect(is.NonNullable("")).toBe(true);
            });

            it("should return false for null and undefined", () => {
                expect(is.NonNullable(null)).toBe(false);
                expect(is.NonNullable(undefined)).toBe(false);
            });
        });

        describe("is.Provenance", () => {
            it("should return true for objects with required provenance properties", () => {
                const provenance = {
                    jsonPath: "/path/to/node",
                    name: "testName",
                    node: {}
                };
                expect(is.Provenance(provenance)).toBe(true);
            });

            it("should return true for provenance with additional properties", () => {
                const provenance = {
                    jsonPath: "/path/to/node",
                    name: "testName",
                    node: {},
                    explicit: true,
                    extra: "property"
                };
                expect(is.Provenance(provenance)).toBe(true);
            });

            it("should return false for objects missing required properties", () => {
                expect(is.Provenance({ jsonPath: "/path", name: "test" })).toBe(false);
                expect(is.Provenance({ jsonPath: "/path", node: {} })).toBe(false);
                expect(is.Provenance({ name: "test", node: {} })).toBe(false);
                expect(is.Provenance({})).toBe(false);
            });

            it("should return false for non-objects", () => {
                expect(is.Provenance(null)).toBe(false);
                expect(is.Provenance(undefined)).toBe(false);
                expect(is.Provenance("string")).toBe(false);
                expect(is.Provenance(123)).toBe(false);
                expect(is.Provenance([])).toBe(false);
            });
        });

        describe("is.Explicit", () => {
            it("should return true for provenance with explicit: true", () => {
                const explicit = {
                    jsonPath: "/path/to/node",
                    name: "testName",
                    node: {},
                    explicit: true
                };
                expect(is.Explicit(explicit)).toBe(true);
            });

            it("should return false for provenance with explicit: false", () => {
                const notExplicit = {
                    jsonPath: "/path/to/node",
                    name: "testName",
                    node: {},
                    explicit: false
                };
                expect(is.Explicit(notExplicit)).toBe(false);
            });

            it("should return false for provenance without explicit property", () => {
                const provenance = {
                    jsonPath: "/path/to/node",
                    name: "testName",
                    node: {}
                };
                expect(is.Explicit(provenance)).toBe(false);
            });

            it("should return false for non-provenance objects", () => {
                expect(is.Explicit({ explicit: true })).toBe(false);
                expect(is.Explicit(null)).toBe(false);
                expect(is.Explicit(undefined)).toBe(false);
            });
        });
    });

    describe("Type guards", () => {
        it("should have Type guard functions available", () => {
            // Type guards check instanceof, so they need actual Type instances
            // We're just verifying the functions exist
            expect(typeof is.Primitive.string).toBe("function");
            expect(typeof is.Primitive.boolean).toBe("function");
            expect(typeof is.Primitive.int).toBe("function");
            expect(typeof is.Primitive.long).toBe("function");
            expect(typeof is.Primitive.uint).toBe("function");
            expect(typeof is.Primitive.ulong).toBe("function");
            expect(typeof is.Primitive.float).toBe("function");
            expect(typeof is.Primitive.double).toBe("function");
            expect(typeof is.Value.dateTime).toBe("function");
            expect(typeof is.Value.uuid).toBe("function");
            expect(typeof is.Primitive.object).toBe("function");
            expect(typeof is.Collection.array).toBe("function");
            expect(typeof is.Value.byte).toBe("function");
        });

        it("should return false for undefined", () => {
            expect(is.Primitive.string(undefined)).toBe(false);
            expect(is.Primitive.boolean(undefined)).toBe(false);
            expect(is.Primitive.int(undefined)).toBe(false);
            expect(is.Primitive.object(undefined)).toBe(false);
        });
    });

    describe("assert functions", () => {
        describe("assert.object", () => {
            it("should return true for objects", () => {
                expect(assert.object({})).toBe(true);
                expect(assert.object({ key: "value" })).toBe(true);
            });

            it("should throw for non-objects", () => {
                expect(() => assert.object(null)).toThrow();
                expect(() => assert.object(undefined)).toThrow();
                expect(() => assert.object("string")).toThrow();
                expect(() => assert.object(123)).toThrow();
                expect(() => assert.object([])).toThrow();
            });

            it("should include value in error message", () => {
                expect(() => assert.object(123)).toThrow("Not an object type");
            });
        });
    });

    describe("type narrowing", () => {
        it("should narrow string types correctly", () => {
            const value: unknown = "test";
            if (is.string(value)) {
                // TypeScript should infer value as string
                const length: number = value.length;
                expect(length).toBe(4);
            }
        });

        it("should narrow number types correctly", () => {
            const value: unknown = 42;
            if (is.number(value)) {
                // TypeScript should infer value as number
                const doubled: number = value * 2;
                expect(doubled).toBe(84);
            }
        });

        it("should narrow array types correctly", () => {
            const value: unknown = [1, 2, 3];
            if (is.array(value)) {
                // TypeScript should infer value as unknown[]
                const length: number = value.length;
                expect(length).toBe(3);
            }
        });

        it("should narrow object types correctly", () => {
            const value: unknown = { key: "value" };
            if (is.object(value)) {
                // TypeScript should infer value as object
                expect(typeof value).toBe("object");
            }
        });

        it("should narrow NonNullable types correctly", () => {
            const value: string | null | undefined = "test";
            if (is.NonNullable(value)) {
                // TypeScript should infer value as string
                const length: number = value.length;
                expect(length).toBe(4);
            }
        });
    });

    describe("complex scenarios", () => {
        it("should handle nested type checks", () => {
            const value: unknown = { nested: { value: "test" } };

            if (is.object(value) && "nested" in value) {
                const nested = value.nested;
                if (is.object(nested) && "value" in nested) {
                    expect(is.string(nested.value)).toBe(true);
                }
            }
        });

        it("should handle arrays of specific types", () => {
            const value: unknown = [1, 2, 3, 4, 5];

            if (is.array(value)) {
                const allNumbers = value.every((item) => is.number(item));
                expect(allNumbers).toBe(true);
            }
        });

        it("should handle union types", () => {
            const testValues: unknown[] = ["string", 123, true, null, undefined, {}, []];

            const strings = testValues.filter(is.string);
            const numbers = testValues.filter(is.number);
            const booleans = testValues.filter(is.boolean);
            const objects = testValues.filter(is.object);
            const arrays = testValues.filter(is.array);

            expect(strings).toEqual(["string"]);
            expect(numbers).toEqual([123]);
            expect(booleans).toEqual([true]);
            expect(objects).toEqual([{}]);
            expect(arrays).toEqual([[]]);
        });

        it("should handle provenance objects with various shapes", () => {
            const validProvenance = {
                jsonPath: "/test",
                name: "testName",
                node: { type: "test" }
            };

            const validExplicit = {
                jsonPath: "/test",
                name: "testName",
                node: { type: "test" },
                explicit: true
            };

            const invalidProvenance = {
                jsonPath: "/test",
                name: "testName"
                // missing node
            };

            expect(is.Provenance(validProvenance)).toBe(true);
            expect(is.Provenance(validExplicit)).toBe(true);
            expect(is.Provenance(invalidProvenance)).toBe(false);

            expect(is.Explicit(validExplicit)).toBe(true);
            expect(is.Explicit(validProvenance)).toBe(false);
        });
    });

    describe("edge cases", () => {
        it("should handle special number values", () => {
            expect(is.number(Number.NaN)).toBe(true);
            expect(is.number(Number.POSITIVE_INFINITY)).toBe(true);
            expect(is.number(Number.NEGATIVE_INFINITY)).toBe(true);
            expect(is.number(Number.MAX_VALUE)).toBe(true);
            expect(is.number(Number.MIN_VALUE)).toBe(true);
        });

        it("should handle empty strings and arrays", () => {
            expect(is.string("")).toBe(true);
            expect(is.array([])).toBe(true);
        });

        it("should handle objects with null prototype", () => {
            const obj = Object.create(null);
            expect(is.object(obj)).toBe(true);
        });

        it("should handle boxed primitives", () => {
            // Boxed primitives are objects, not primitives
            expect(is.string(new String("test"))).toBe(false);
            expect(is.number(new Number(123))).toBe(false);
            expect(is.boolean(new Boolean(true))).toBe(false);
        });

        it("should handle Symbol and BigInt", () => {
            expect(is.string(Symbol("test"))).toBe(false);
            expect(is.number(BigInt(123))).toBe(false);
        });
    });
});
