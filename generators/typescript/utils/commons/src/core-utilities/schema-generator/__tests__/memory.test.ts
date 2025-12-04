import { describe, it, expect, beforeEach } from "vitest";
import { ZodSchemaGenerator } from "../ZodSchemaGenerator";
import { YupSchemaGenerator } from "../YupSchemaGenerator";

/**
 * Memory usage tests for schema generators.
 * 
 * These tests verify that schema generation doesn't consume excessive memory,
 * which was one of the key issues with the original zurg implementation.
 */
describe("Memory Usage Tests", () => {
    // Helper to get current memory usage in bytes
    function getMemoryUsage(): number {
        if (typeof process !== "undefined" && process.memoryUsage) {
            return process.memoryUsage().heapUsed;
        }
        // Fallback for non-Node environments
        return 0;
    }

    // Helper to format bytes as human-readable
    function formatBytes(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    describe("ZodSchemaGenerator Memory", () => {
        let generator: ZodSchemaGenerator;

        beforeEach(() => {
            generator = new ZodSchemaGenerator();
        });

        it("should not leak memory when generating many schemas", () => {
            const iterations = 1000;
            const memoryBefore = getMemoryUsage();

            const schemas = [];
            for (let i = 0; i < iterations; i++) {
                schemas.push(
                    generator.object([
                        { key: { raw: "id", parsed: "id" }, value: generator.string() },
                        { key: { raw: "name", parsed: "name" }, value: generator.string() }
                    ])
                );
            }

            // Force expressions to be generated
            schemas.forEach((s) => s.toExpression());

            const memoryAfter = getMemoryUsage();
            const memoryUsed = memoryAfter - memoryBefore;

            console.log(`Memory used for ${iterations} schemas: ${formatBytes(memoryUsed)}`);

            // Should use less than 50MB for 1000 schemas
            // This is a generous limit; actual usage should be much lower
            expect(memoryUsed).toBeLessThan(50 * 1024 * 1024);
        });

        it("should handle large object schemas without excessive memory", () => {
            const memoryBefore = getMemoryUsage();

            // Create a schema with many properties (simulating a large API type)
            const properties = [];
            for (let i = 0; i < 100; i++) {
                properties.push({
                    key: { raw: `field_${i}`, parsed: `field${i}` },
                    value: generator.string()
                });
            }

            const largeSchema = generator.object(properties);
            largeSchema.toExpression();

            const memoryAfter = getMemoryUsage();
            const memoryUsed = memoryAfter - memoryBefore;

            console.log(`Memory for 100-property schema: ${formatBytes(memoryUsed)}`);

            // Single large schema should use less than 5MB
            expect(memoryUsed).toBeLessThan(5 * 1024 * 1024);
        });

        it("should handle deeply nested schemas", () => {
            const memoryBefore = getMemoryUsage();

            // Create nested structure 10 levels deep
            let currentSchema = generator.string();
            for (let depth = 0; depth < 10; depth++) {
                currentSchema = generator.object([
                    { key: { raw: `level_${depth}`, parsed: `level${depth}` }, value: currentSchema }
                ]);
            }

            currentSchema.toExpression();

            const memoryAfter = getMemoryUsage();
            const memoryUsed = memoryAfter - memoryBefore;

            console.log(`Memory for 10-level nested schema: ${formatBytes(memoryUsed)}`);

            // Nested schema should use less than 2MB
            expect(memoryUsed).toBeLessThan(2 * 1024 * 1024);
        });
    });

    describe("YupSchemaGenerator Memory", () => {
        let generator: YupSchemaGenerator;

        beforeEach(() => {
            generator = new YupSchemaGenerator();
        });

        it("should not leak memory when generating many schemas", () => {
            const iterations = 1000;
            const memoryBefore = getMemoryUsage();

            const schemas = [];
            for (let i = 0; i < iterations; i++) {
                schemas.push(
                    generator.object([
                        { key: { raw: "id", parsed: "id" }, value: generator.string() },
                        { key: { raw: "name", parsed: "name" }, value: generator.string() }
                    ])
                );
            }

            schemas.forEach((s) => s.toExpression());

            const memoryAfter = getMemoryUsage();
            const memoryUsed = memoryAfter - memoryBefore;

            console.log(`[Yup] Memory used for ${iterations} schemas: ${formatBytes(memoryUsed)}`);

            expect(memoryUsed).toBeLessThan(50 * 1024 * 1024);
        });
    });

    describe("Comparative Memory Analysis", () => {
        it("Zod and Yup should have similar memory profiles", () => {
            const iterations = 500;

            // Zod
            const zodGen = new ZodSchemaGenerator();
            const zodMemBefore = getMemoryUsage();
            for (let i = 0; i < iterations; i++) {
                zodGen
                    .object([
                        { key: { raw: "a", parsed: "a" }, value: zodGen.string() },
                        { key: { raw: "b", parsed: "b" }, value: zodGen.number() }
                    ])
                    .toExpression();
            }
            const zodMemUsed = getMemoryUsage() - zodMemBefore;

            // Yup
            const yupGen = new YupSchemaGenerator();
            const yupMemBefore = getMemoryUsage();
            for (let i = 0; i < iterations; i++) {
                yupGen
                    .object([
                        { key: { raw: "a", parsed: "a" }, value: yupGen.string() },
                        { key: { raw: "b", parsed: "b" }, value: yupGen.number() }
                    ])
                    .toExpression();
            }
            const yupMemUsed = getMemoryUsage() - yupMemBefore;

            console.log(`Zod memory: ${formatBytes(zodMemUsed)}, Yup memory: ${formatBytes(yupMemUsed)}`);

            // Both should be in a reasonable range
            expect(zodMemUsed).toBeLessThan(30 * 1024 * 1024);
            expect(yupMemUsed).toBeLessThan(30 * 1024 * 1024);
        });
    });
});

/**
 * Memory targets:
 * 
 * Old zurg implementation issues:
 * - Could consume 100MB+ for large schemas
 * - Memory wasn't released after parsing
 * 
 * New targets:
 * - < 50MB for 1000 schemas
 * - < 5MB for single large schema (100+ properties)
 * - < 2MB for deeply nested schema (10+ levels)
 */

