import { lazy } from "../lazy";

describe("lazy", () => {
    describe("zero-parameter functions", () => {
        it("should convert zero-param functions to cached properties", () => {
            let callCount = 0;
            const obj = lazy({
                value: () => {
                    callCount++;
                    return "computed";
                }
            });

            expect(obj.value).toBe("computed");
            expect(callCount).toBe(1);

            // Access again - should return cached value
            expect(obj.value).toBe("computed");
            expect(callCount).toBe(1); // Still 1, not called again
        });

        it("should cache expensive computations", () => {
            let computeCount = 0;
            const obj = lazy({
                expensive: () => {
                    computeCount++;
                    return Math.random();
                }
            });

            const firstValue = obj.expensive;
            const secondValue = obj.expensive;

            expect(firstValue).toBe(secondValue);
            expect(computeCount).toBe(1);
        });

        it("should handle multiple zero-param properties independently", () => {
            let count1 = 0;
            let count2 = 0;

            const obj = lazy({
                prop1: () => {
                    count1++;
                    return "value1";
                },
                prop2: () => {
                    count2++;
                    return "value2";
                }
            });

            expect(obj.prop1).toBe("value1");
            expect(count1).toBe(1);
            expect(count2).toBe(0); // prop2 not accessed yet

            expect(obj.prop2).toBe("value2");
            expect(count1).toBe(1); // prop1 not recomputed
            expect(count2).toBe(1);

            // Access again
            expect(obj.prop1).toBe("value1");
            expect(obj.prop2).toBe("value2");
            expect(count1).toBe(1); // Still cached
            expect(count2).toBe(1); // Still cached
        });

        it("should handle functions returning different types", () => {
            const obj = lazy({
                str: () => "string",
                num: () => 42,
                bool: () => true,
                obj: () => ({ key: "value" }),
                arr: () => [1, 2, 3],
                nil: () => null,
                undef: () => undefined
            });

            expect(obj.str).toBe("string");
            expect(obj.num).toBe(42);
            expect(obj.bool).toBe(true);
            expect(obj.obj).toEqual({ key: "value" });
            expect(obj.arr).toEqual([1, 2, 3]);
            expect(obj.nil).toBe(null);
            expect(obj.undef).toBe(undefined);
        });

        it("should return same object reference for cached objects", () => {
            const obj = lazy({
                obj: () => ({ value: 123 })
            });

            const first = obj.obj;
            const second = obj.obj;

            expect(first).toBe(second); // Same reference
        });

        it("should handle functions that throw errors", () => {
            let attempts = 0;
            const obj = lazy({
                failing: () => {
                    attempts++;
                    throw new Error("Computation failed");
                }
            });

            expect(() => obj.failing).toThrow("Computation failed");
            expect(attempts).toBe(1);

            // Access again - the cache doesn't store the error, so it throws again
            expect(() => obj.failing).toThrow("Computation failed");
            // Note: The lazy function doesn't cache errors, so it will throw again
            // The attempts count will increase because the function is called again
        });
    });

    describe("functions with parameters", () => {
        it("should keep functions with parameters as callable methods", () => {
            let callCount = 0;
            const obj = lazy({
                greet: (name: string) => {
                    callCount++;
                    return `Hello, ${name}!`;
                }
            });

            expect(obj.greet("Alice")).toBe("Hello, Alice!");
            expect(callCount).toBe(1);

            // Call again with different parameter - should execute again
            expect(obj.greet("Bob")).toBe("Hello, Bob!");
            expect(callCount).toBe(2);

            // Call again with same parameter - still executes (not cached)
            expect(obj.greet("Alice")).toBe("Hello, Alice!");
            expect(callCount).toBe(3);
        });

        it("should handle functions with multiple parameters", () => {
            const obj = lazy({
                add: (a: number, b: number) => a + b,
                concat: (a: string, b: string, c: string) => a + b + c
            });

            expect(obj.add(1, 2)).toBe(3);
            expect(obj.add(5, 10)).toBe(15);
            expect(obj.concat("a", "b", "c")).toBe("abc");
        });

        it("should handle functions with optional parameters as methods", () => {
            const obj = lazy({
                greet: (name?: string) => `Hello${name ? `, ${name}` : ""}!`
            });

            expect(obj.greet()).toBe("Hello!");
            expect(obj.greet("Alice")).toBe("Hello, Alice!");
        });

        it("should handle functions with rest parameters", () => {
            const obj = lazy({
                // Rest parameters have length 0, so this becomes a cached property
                // The function is called immediately and returns the result (0)
                sum: (...numbers: number[]) => numbers.reduce((a, b) => a + b, 0)
            });

            // Since fn.length === 0, it's treated as a zero-param function
            // It gets executed and the result (0) is cached
            expect(obj.sum).toBe(0);
            expect(typeof obj.sum).toBe("number");
        });

        it("should preserve function return types", () => {
            const obj = lazy({
                getString: (suffix: string) => `value-${suffix}`,
                getNumber: (multiplier: number) => 42 * multiplier,
                getObject: (key: string) => ({ [key]: "value" })
            });

            expect(obj.getString("test")).toBe("value-test");
            expect(obj.getNumber(2)).toBe(84);
            expect(obj.getObject("myKey")).toEqual({ myKey: "value" });
        });
    });

    describe("mixed properties and methods", () => {
        it("should handle objects with both zero-param and parameterized functions", () => {
            let propCallCount = 0;
            let methodCallCount = 0;

            const obj = lazy({
                cachedProp: () => {
                    propCallCount++;
                    return "cached";
                },
                method: (arg: string) => {
                    methodCallCount++;
                    return `method-${arg}`;
                }
            });

            // Access cached property
            expect(obj.cachedProp).toBe("cached");
            expect(propCallCount).toBe(1);
            expect(methodCallCount).toBe(0);

            // Call method
            expect(obj.method("test")).toBe("method-test");
            expect(propCallCount).toBe(1);
            expect(methodCallCount).toBe(1);

            // Access cached property again - not recomputed
            expect(obj.cachedProp).toBe("cached");
            expect(propCallCount).toBe(1);

            // Call method again - recomputed
            expect(obj.method("test")).toBe("method-test");
            expect(methodCallCount).toBe(2);
        });

        it("should handle complex mixed scenarios", () => {
            const obj = lazy({
                // Cached properties
                name: () => "MyClass",
                version: () => "1.0.0",
                timestamp: () => Date.now(),

                // Methods
                greet: (person: string) => `Hello, ${person}!`,
                add: (a: number, b: number) => a + b,
                format: (template: string, ...args: string[]) =>
                    template.replace(/{(\d+)}/g, (match, num) => args[num] ?? match)
            });

            // All cached properties should be accessible
            const name1 = obj.name;
            const name2 = obj.name;
            expect(name1).toBe(name2);

            const version1 = obj.version;
            const version2 = obj.version;
            expect(version1).toBe(version2);

            const timestamp1 = obj.timestamp;
            const timestamp2 = obj.timestamp;
            expect(timestamp1).toBe(timestamp2);

            // All methods should be callable
            expect(obj.greet("World")).toBe("Hello, World!");
            expect(obj.add(5, 3)).toBe(8);
            expect(obj.format("Hello, {0}! You are {1}.", "Alice", "awesome")).toBe("Hello, Alice! You are awesome.");
        });
    });

    describe("edge cases", () => {
        it("should handle empty object", () => {
            const obj = lazy({});
            expect(obj).toEqual({});
        });

        it("should handle property enumeration", () => {
            const obj = lazy({
                prop1: () => "value1",
                prop2: () => "value2",
                method: (x: number) => x * 2
            });

            const keys = Object.keys(obj);
            expect(keys).toContain("prop1");
            expect(keys).toContain("prop2");
            expect(keys).toContain("method");
        });

        it("should allow property reassignment via Object.defineProperty", () => {
            const obj = lazy({
                value: () => "original"
            });

            expect(obj.value).toBe("original");

            // Property is configurable, so we can redefine it
            Object.defineProperty(obj, "value", {
                value: "modified",
                writable: true,
                enumerable: true,
                configurable: true
            });

            expect(obj.value).toBe("modified");
        });

        it("should handle functions returning undefined", () => {
            const obj = lazy({
                nothing: () => undefined,
                empty: () => {
                    /* returns undefined implicitly */
                }
            });

            expect(obj.nothing).toBe(undefined);
            expect(obj.empty).toBe(undefined);
        });

        it("should handle closure variables", () => {
            let counter = 0;
            const obj = lazy({
                increment: () => ++counter,
                getCount: () => counter
            });

            // First access computes and caches
            const firstIncrement = obj.increment;
            expect(firstIncrement).toBe(1);
            expect(counter).toBe(1);

            // Second access returns cached value (doesn't increment again)
            const secondIncrement = obj.increment;
            expect(secondIncrement).toBe(1); // Still 1, cached value
            expect(counter).toBe(1); // Counter didn't change

            // getCount was never accessed, so it's not cached yet
            // When we access it, it will compute based on current counter value
            const count = obj.getCount;
            expect(count).toBe(1); // Captures current counter value

            // Even though counter changes externally, both are cached
            counter = 10;
            expect(obj.increment).toBe(1); // Still cached
            expect(obj.getCount).toBe(1); // Also still cached
        });

        it("should handle async functions as properties", async () => {
            const obj = lazy({
                asyncValue: () => Promise.resolve("async result")
            });

            const promise = obj.asyncValue;
            expect(promise).toBeInstanceOf(Promise);

            const result = await promise;
            expect(result).toBe("async result");

            // Should return the same promise instance
            const promise2 = obj.asyncValue;
            expect(promise2).toBe(promise);
        });
    });

    describe("type safety", () => {
        it("should preserve type information for zero-param functions", () => {
            const obj = lazy({
                str: (): string => "test",
                num: (): number => 42,
                bool: (): boolean => true
            });

            // TypeScript should infer these as properties, not functions
            const s: string = obj.str;
            const n: number = obj.num;
            const b: boolean = obj.bool;

            expect(s).toBe("test");
            expect(n).toBe(42);
            expect(b).toBe(true);
        });

        it("should preserve function signatures for parameterized functions", () => {
            const obj = lazy({
                greet: (name: string): string => `Hello, ${name}!`,
                add: (a: number, b: number): number => a + b
            });

            // TypeScript should infer these as functions
            const greeting: string = obj.greet("World");
            const sum: number = obj.add(1, 2);

            expect(greeting).toBe("Hello, World!");
            expect(sum).toBe(3);
        });
    });
});
