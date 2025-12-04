import { describe, it, expect } from "vitest";
import { ZodSerializationCodeGenerator } from "../ZodSchemaGenerator";

/**
 * Performance tests for schema generators.
 * 
 * These tests measure the BUILD-TIME performance of generating schema AST.
 * Runtime performance (actual parsing) depends on the generated code running in the SDK.
 */
describe("Performance Tests", () => {
    describe("ZodSerializationCodeGenerator - Build Time Performance", () => {
        it("should generate 1000 simple schemas in < 100ms", () => {
            const generator = new ZodSerializationCodeGenerator();
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
            const generator = new ZodSerializationCodeGenerator();
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
            const generator = new ZodSerializationCodeGenerator();
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
            const generator = new ZodSerializationCodeGenerator();
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
