import { describe, it, expect, beforeAll } from "vitest";
import { ts } from "ts-morph";
import { performance } from "perf_hooks";

import { Reference } from "../../referencing";
import { ZurgImpl } from "../../core-utilities/Zurg";

/**
 * Create a mock reference for testing
 */
function createMockReference(exportedName: string): Reference {
    return {
        getExpression: () => {
            return ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("serialization"),
                ts.factory.createIdentifier(exportedName)
            );
        },
        getTypeNode: () => {
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier("serialization"),
                    ts.factory.createIdentifier(exportedName)
                ),
                undefined
            );
        },
        getEntityName: () => {
            return ts.factory.createQualifiedName(
                ts.factory.createIdentifier("serialization"),
                ts.factory.createIdentifier(exportedName)
            );
        }
    };
}

/**
 * Create a ZurgImpl instance for testing
 */
function createZurg(): ZurgImpl {
    return new ZurgImpl({
        getReferenceToExport: ({ exportedName }) => createMockReference(exportedName),
        generateEndpointMetadata: false
    });
}

/**
 * Benchmark result structure
 */
interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTimeMs: number;
    avgTimeMs: number;
    opsPerSecond: number;
    memoryUsedMB: number;
}

/**
 * Run a benchmark for a given operation
 */
function benchmark(name: string, fn: () => void, iterations: number = 1000): BenchmarkResult {
    // Force GC if available (run with --expose-gc flag)
    if (global.gc) {
        global.gc();
    }

    const memBefore = process.memoryUsage().heapUsed;

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();

    const memAfter = process.memoryUsage().heapUsed;

    const totalTimeMs = end - start;
    const avgTimeMs = totalTimeMs / iterations;
    const opsPerSecond = 1000 / avgTimeMs;
    const memoryUsedMB = (memAfter - memBefore) / 1024 / 1024;

    return {
        name,
        iterations,
        totalTimeMs,
        avgTimeMs,
        opsPerSecond,
        memoryUsedMB
    };
}

/**
 * Format benchmark results for logging
 */
function formatResult(result: BenchmarkResult): string {
    return `${result.name}:
  - Iterations: ${result.iterations}
  - Total time: ${result.totalTimeMs.toFixed(2)}ms
  - Avg time: ${result.avgTimeMs.toFixed(4)}ms
  - Ops/sec: ${result.opsPerSecond.toFixed(2)}
  - Memory delta: ${result.memoryUsedMB.toFixed(2)}MB`;
}

describe("Zurg Performance Benchmarks", () => {
    let zurg: ZurgImpl;

    beforeAll(() => {
        zurg = createZurg();
    });

    describe("Primitive Schema Creation", () => {
        it("string() creation performance", () => {
            const result = benchmark("string()", () => {
                zurg.string();
            }, 10000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(1); // Should be sub-millisecond
        });

        it("number() creation performance", () => {
            const result = benchmark("number()", () => {
                zurg.number();
            }, 10000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(1);
        });

        it("boolean() creation performance", () => {
            const result = benchmark("boolean()", () => {
                zurg.boolean();
            }, 10000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(1);
        });
    });

    describe("Object Schema Creation", () => {
        it("simple object (3 properties) creation performance", () => {
            const result = benchmark("object (3 props)", () => {
                zurg.object([
                    { key: { parsed: "id", raw: "id" }, value: zurg.string() },
                    { key: { parsed: "name", raw: "name" }, value: zurg.string() },
                    { key: { parsed: "age", raw: "age" }, value: zurg.number() }
                ]);
            }, 5000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(5);
        });

        it("medium object (10 properties) creation performance", () => {
            const result = benchmark("object (10 props)", () => {
                zurg.object([
                    { key: { parsed: "id", raw: "id" }, value: zurg.string() },
                    { key: { parsed: "name", raw: "name" }, value: zurg.string() },
                    { key: { parsed: "email", raw: "email" }, value: zurg.string() },
                    { key: { parsed: "age", raw: "age" }, value: zurg.number() },
                    { key: { parsed: "active", raw: "active" }, value: zurg.boolean() },
                    { key: { parsed: "createdAt", raw: "created_at" }, value: zurg.date() },
                    { key: { parsed: "updatedAt", raw: "updated_at" }, value: zurg.date() },
                    { key: { parsed: "role", raw: "role" }, value: zurg.enum(["admin", "user", "guest"]) },
                    { key: { parsed: "tags", raw: "tags" }, value: zurg.list(zurg.string()) },
                    { key: { parsed: "metadata", raw: "metadata" }, value: zurg.record({ keySchema: zurg.string(), valueSchema: zurg.any() }) }
                ]);
            }, 2000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(10);
        });

        it("object with property renaming performance", () => {
            const result = benchmark("object (renamed props)", () => {
                zurg.object([
                    { key: { parsed: "firstName", raw: "first_name" }, value: zurg.string() },
                    { key: { parsed: "lastName", raw: "last_name" }, value: zurg.string() },
                    { key: { parsed: "emailAddress", raw: "email_address" }, value: zurg.string() },
                    { key: { parsed: "phoneNumber", raw: "phone_number" }, value: zurg.string() },
                    { key: { parsed: "dateOfBirth", raw: "date_of_birth" }, value: zurg.date() }
                ]);
            }, 3000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(5);
        });
    });

    describe("Union Schema Creation", () => {
        it("discriminated union (3 variants) creation performance", () => {
            const result = benchmark("union (3 variants)", () => {
                zurg.union({
                    parsedDiscriminant: "type",
                    rawDiscriminant: "type",
                    singleUnionTypes: [
                        {
                            discriminantValue: "dog",
                            nonDiscriminantProperties: zurg.object([
                                { key: { parsed: "breed", raw: "breed" }, value: zurg.string() }
                            ])
                        },
                        {
                            discriminantValue: "cat",
                            nonDiscriminantProperties: zurg.object([
                                { key: { parsed: "indoor", raw: "indoor" }, value: zurg.boolean() }
                            ])
                        },
                        {
                            discriminantValue: "bird",
                            nonDiscriminantProperties: zurg.object([
                                { key: { parsed: "canFly", raw: "can_fly" }, value: zurg.boolean() }
                            ])
                        }
                    ]
                });
            }, 2000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(10);
        });

        it("undiscriminated union (5 types) creation performance", () => {
            const result = benchmark("undiscriminatedUnion (5 types)", () => {
                zurg.undiscriminatedUnion([
                    zurg.string(),
                    zurg.number(),
                    zurg.boolean(),
                    zurg.object([{ key: { parsed: "id", raw: "id" }, value: zurg.string() }]),
                    zurg.list(zurg.string())
                ]);
            }, 3000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(5);
        });
    });

    describe("Collection Schema Creation", () => {
        it("list schema creation performance", () => {
            const result = benchmark("list(string())", () => {
                zurg.list(zurg.string());
            }, 5000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });

        it("nested list schema creation performance", () => {
            const result = benchmark("list(list(string()))", () => {
                zurg.list(zurg.list(zurg.string()));
            }, 3000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(3);
        });

        it("record schema creation performance", () => {
            const result = benchmark("record(string, object)", () => {
                zurg.record({
                    keySchema: zurg.string(),
                    valueSchema: zurg.object([
                        { key: { parsed: "name", raw: "name" }, value: zurg.string() }
                    ])
                });
            }, 3000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(5);
        });
    });

    describe("AST Generation (toExpression)", () => {
        it("simple object toExpression() performance", () => {
            const schema = zurg.object([
                { key: { parsed: "id", raw: "id" }, value: zurg.string() },
                { key: { parsed: "name", raw: "name" }, value: zurg.string() }
            ]);

            const result = benchmark("object.toExpression()", () => {
                schema.toExpression();
            }, 5000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(1);
        });

        it("complex nested schema toExpression() performance", () => {
            const schema = zurg.object([
                {
                    key: { parsed: "user", raw: "user" },
                    value: zurg.object([
                        { key: { parsed: "id", raw: "id" }, value: zurg.string() },
                        { key: { parsed: "profile", raw: "profile" }, value: zurg.object([
                            { key: { parsed: "name", raw: "name" }, value: zurg.string() },
                            { key: { parsed: "age", raw: "age" }, value: zurg.number().optional() },
                            { key: { parsed: "tags", raw: "tags" }, value: zurg.list(zurg.string()) }
                        ])}
                    ])
                },
                {
                    key: { parsed: "permissions", raw: "permissions" },
                    value: zurg.list(zurg.enum(["read", "write", "admin"]))
                }
            ]);

            const result = benchmark("complex.toExpression()", () => {
                schema.toExpression();
            }, 2000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });
    });

    describe("Schema Operations", () => {
        it("optional() chain performance", () => {
            const result = benchmark("string().optional()", () => {
                zurg.string().optional();
            }, 5000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });

        it("nullable() chain performance", () => {
            const result = benchmark("string().nullable()", () => {
                zurg.string().nullable();
            }, 5000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });

        it("object.extend() performance", () => {
            const baseSchema = zurg.object([
                { key: { parsed: "id", raw: "id" }, value: zurg.string() }
            ]);

            const result = benchmark("object.extend()", () => {
                baseSchema.extend(
                    zurg.object([
                        { key: { parsed: "name", raw: "name" }, value: zurg.string() }
                    ])
                );
            }, 3000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(5);
        });

        it("lazy() wrapper performance", () => {
            const innerSchema = zurg.object([
                { key: { parsed: "id", raw: "id" }, value: zurg.string() }
            ]);

            const result = benchmark("lazy()", () => {
                zurg.lazy(innerSchema);
            }, 5000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });

        it("lazyObject() wrapper performance", () => {
            const innerSchema = zurg.object([
                { key: { parsed: "id", raw: "id" }, value: zurg.string() }
            ]);

            const result = benchmark("lazyObject()", () => {
                zurg.lazyObject(innerSchema);
            }, 5000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });
    });

    describe("Parse/JSON Expression Generation", () => {
        it("parse() expression generation performance", () => {
            const schema = zurg.object([
                { key: { parsed: "id", raw: "id" }, value: zurg.string() },
                { key: { parsed: "name", raw: "name" }, value: zurg.string() }
            ]);
            const rawExpr = ts.factory.createIdentifier("raw");

            const result = benchmark("schema.parse()", () => {
                schema.parse(rawExpr, {
                    unrecognizedObjectKeys: "fail",
                    allowUnrecognizedUnionMembers: false,
                    allowUnrecognizedEnumValues: false,
                    skipValidation: false,
                    omitUndefined: false,
                    breadcrumbsPrefix: []
                });
            }, 3000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });

        it("json() expression generation performance", () => {
            const schema = zurg.object([
                { key: { parsed: "id", raw: "id" }, value: zurg.string() },
                { key: { parsed: "name", raw: "name" }, value: zurg.string() }
            ]);
            const parsedExpr = ts.factory.createIdentifier("parsed");

            const result = benchmark("schema.json()", () => {
                schema.json(parsedExpr, {
                    unrecognizedObjectKeys: "fail",
                    allowUnrecognizedUnionMembers: false,
                    allowUnrecognizedEnumValues: false,
                    skipValidation: false,
                    omitUndefined: false,
                    breadcrumbsPrefix: []
                });
            }, 3000);

            console.log(formatResult(result));
            expect(result.avgTimeMs).toBeLessThan(2);
        });
    });

    describe("Realistic Workload Simulation", () => {
        it("simulate generating schemas for 100 types", () => {
            const result = benchmark("100 type schemas", () => {
                // Simulate a mix of types that might be in a real API
                for (let i = 0; i < 100; i++) {
                    const typeIndex = i % 5;
                    switch (typeIndex) {
                        case 0:
                            // Simple object
                            zurg.object([
                                { key: { parsed: "id", raw: "id" }, value: zurg.string() },
                                { key: { parsed: "value", raw: "value" }, value: zurg.number() }
                            ]);
                            break;
                        case 1:
                            // Enum
                            zurg.enum(["A", "B", "C"]);
                            break;
                        case 2:
                            // List
                            zurg.list(zurg.string());
                            break;
                        case 3:
                            // Union
                            zurg.union({
                                parsedDiscriminant: "type",
                                rawDiscriminant: "type",
                                singleUnionTypes: [
                                    {
                                        discriminantValue: "a",
                                        nonDiscriminantProperties: zurg.object([])
                                    },
                                    {
                                        discriminantValue: "b",
                                        nonDiscriminantProperties: zurg.object([])
                                    }
                                ]
                            });
                            break;
                        case 4:
                            // Complex object
                            zurg.object([
                                { key: { parsed: "firstName", raw: "first_name" }, value: zurg.string() },
                                { key: { parsed: "lastName", raw: "last_name" }, value: zurg.string() },
                                { key: { parsed: "email", raw: "email" }, value: zurg.string().optional() },
                                { key: { parsed: "tags", raw: "tags" }, value: zurg.list(zurg.string()) }
                            ]);
                            break;
                    }
                }
            }, 100);

            console.log(formatResult(result));
            // 100 types should complete in reasonable time
            expect(result.avgTimeMs).toBeLessThan(500);
        });
    });
});

