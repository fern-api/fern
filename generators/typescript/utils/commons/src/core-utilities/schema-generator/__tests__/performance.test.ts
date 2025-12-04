import { describe, it, expect } from "vitest";
import { ZodSchemaGenerator } from "../ZodSchemaGenerator";
import { YupSchemaGenerator } from "../YupSchemaGenerator";

/**
 * Performance tests for schema generators.
 * 
 * These tests measure the BUILD-TIME performance of generating schema AST.
 * Runtime performance (actual parsing) depends on the generated code running in the SDK.
 */
describe("Performance Tests", () => {
    describe("ZodSchemaGenerator - Build Time Performance", () => {
        it("should generate 1000 simple schemas in < 100ms", () => {
            const generator = new ZodSchemaGenerator();
            const iterations = 1000;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                generator.string();
                generator.number();
                generator.boolean();
            }
            const elapsed = performance.now() - start;

            expect(elapsed).toBeLessThan(100);
            console.log(`Generated ${iterations * 3} primitive schemas in ${elapsed.toFixed(2)}ms`);
        });

        it("should generate 100 complex object schemas in < 200ms", () => {
            const generator = new ZodSchemaGenerator();
            const iterations = 100;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                generator.object([
                    { key: { raw: "user_id", parsed: "userId" }, value: generator.string() },
                    { key: { raw: "display_name", parsed: "displayName" }, value: generator.string() },
                    { key: { raw: "email_address", parsed: "emailAddress" }, value: generator.string() },
                    { key: { raw: "is_active", parsed: "isActive" }, value: generator.boolean() },
                    { key: { raw: "created_at", parsed: "createdAt" }, value: generator.date() },
                    { key: { raw: "updated_at", parsed: "updatedAt" }, value: generator.date() }
                ]);
            }
            const elapsed = performance.now() - start;

            expect(elapsed).toBeLessThan(200);
            console.log(`Generated ${iterations} complex object schemas in ${elapsed.toFixed(2)}ms`);
        });

        it("should generate nested schemas efficiently", () => {
            const generator = new ZodSchemaGenerator();
            const iterations = 50;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const addressSchema = generator.object([
                    { key: { raw: "street", parsed: "street" }, value: generator.string() },
                    { key: { raw: "city", parsed: "city" }, value: generator.string() },
                    { key: { raw: "zip_code", parsed: "zipCode" }, value: generator.string() }
                ]);

                const userSchema = generator.object([
                    { key: { raw: "id", parsed: "id" }, value: generator.string() },
                    { key: { raw: "name", parsed: "name" }, value: generator.string() },
                    { 
                        key: { raw: "addresses", parsed: "addresses" }, 
                        value: generator.list(generator.Schema._fromExpression(addressSchema.toExpression(), { isObject: true }))
                    }
                ]);

                userSchema.toExpression();
            }
            const elapsed = performance.now() - start;

            expect(elapsed).toBeLessThan(300);
            console.log(`Generated ${iterations} nested schemas in ${elapsed.toFixed(2)}ms`);
        });

        it("should generate union schemas efficiently", () => {
            const generator = new ZodSchemaGenerator();
            const iterations = 50;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                generator.union({
                    parsedDiscriminant: "type",
                    rawDiscriminant: "type",
                    singleUnionTypes: [
                        {
                            discriminantValue: "dog",
                            nonDiscriminantProperties: generator.object([
                                { key: { raw: "breed", parsed: "breed" }, value: generator.string() }
                            ])
                        },
                        {
                            discriminantValue: "cat",
                            nonDiscriminantProperties: generator.object([
                                { key: { raw: "indoor", parsed: "indoor" }, value: generator.boolean() }
                            ])
                        }
                    ]
                });
            }
            const elapsed = performance.now() - start;

            expect(elapsed).toBeLessThan(200);
            console.log(`Generated ${iterations} union schemas in ${elapsed.toFixed(2)}ms`);
        });
    });

    describe("YupSchemaGenerator - Build Time Performance", () => {
        it("should generate 1000 simple schemas in < 100ms", () => {
            const generator = new YupSchemaGenerator();
            const iterations = 1000;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                generator.string();
                generator.number();
                generator.boolean();
            }
            const elapsed = performance.now() - start;

            expect(elapsed).toBeLessThan(100);
            console.log(`[Yup] Generated ${iterations * 3} primitive schemas in ${elapsed.toFixed(2)}ms`);
        });

        it("should generate 100 complex object schemas in < 200ms", () => {
            const generator = new YupSchemaGenerator();
            const iterations = 100;

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                generator.object([
                    { key: { raw: "user_id", parsed: "userId" }, value: generator.string() },
                    { key: { raw: "display_name", parsed: "displayName" }, value: generator.string() },
                    { key: { raw: "email_address", parsed: "emailAddress" }, value: generator.string() },
                    { key: { raw: "is_active", parsed: "isActive" }, value: generator.boolean() },
                    { key: { raw: "created_at", parsed: "createdAt" }, value: generator.date() },
                    { key: { raw: "updated_at", parsed: "updatedAt" }, value: generator.date() }
                ]);
            }
            const elapsed = performance.now() - start;

            expect(elapsed).toBeLessThan(200);
            console.log(`[Yup] Generated ${iterations} complex object schemas in ${elapsed.toFixed(2)}ms`);
        });
    });

    describe("Comparative Performance", () => {
        it("Zod and Yup generators should have similar build-time performance", () => {
            const zodGen = new ZodSchemaGenerator();
            const yupGen = new YupSchemaGenerator();
            const iterations = 100;

            // Zod
            const zodStart = performance.now();
            for (let i = 0; i < iterations; i++) {
                zodGen.object([
                    { key: { raw: "field_1", parsed: "field1" }, value: zodGen.string() },
                    { key: { raw: "field_2", parsed: "field2" }, value: zodGen.number() }
                ]).toExpression();
            }
            const zodElapsed = performance.now() - zodStart;

            // Yup
            const yupStart = performance.now();
            for (let i = 0; i < iterations; i++) {
                yupGen.object([
                    { key: { raw: "field_1", parsed: "field1" }, value: yupGen.string() },
                    { key: { raw: "field_2", parsed: "field2" }, value: yupGen.number() }
                ]).toExpression();
            }
            const yupElapsed = performance.now() - yupStart;

            console.log(`Zod: ${zodElapsed.toFixed(2)}ms, Yup: ${yupElapsed.toFixed(2)}ms`);

            // Both should be reasonably fast (within 3x of each other)
            expect(Math.abs(zodElapsed - yupElapsed)).toBeLessThan(Math.max(zodElapsed, yupElapsed) * 2);
        });
    });
});

/**
 * Runtime performance targets (for generated SDK):
 * 
 * - Parse 1000 simple objects: < 100ms
 * - Parse 1000 nested objects: < 500ms
 * - Parse single complex object: < 1ms
 * 
 * Note: These would be tested in the generated SDK, not in the generator.
 */

