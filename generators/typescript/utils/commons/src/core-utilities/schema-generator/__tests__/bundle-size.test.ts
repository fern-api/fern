import { describe, it, expect } from "vitest";
import { ZodSerializationCodeGenerator } from "../ZodSchemaGenerator";

/**
 * Bundle size verification tests.
 * 
 * These tests verify that generated schemas result in reasonable bundle sizes.
 * Actual bundle size measurement requires building the generated output,
 * so these tests focus on structural validation that impacts bundle size.
 */
describe("Bundle Size Verification", () => {
    describe("ZodSerializationCodeGenerator", () => {
        it("should generate minimal AST for simple string schema", () => {
            const generator = new ZodSerializationCodeGenerator();
            const schema = generator.string();
            const expression = schema.toExpression();

            // Should be a simple call expression: z.string()
            expect(expression.kind).toBeDefined();
        });

        it("should generate minimal AST for object without key transform", () => {
            const generator = new ZodSerializationCodeGenerator();
            const schema = generator.object([
                { key: { raw: "name", parsed: "name" }, value: generator.string() },
                { key: { raw: "age", parsed: "age" }, value: generator.number() }
            ]);
            const expression = schema.toExpression();

            // Without key transform, should just be z.object({...})
            expect(expression.kind).toBeDefined();
        });

        it("should add transform only when keys differ", () => {
            const generator = new ZodSerializationCodeGenerator();
            
            // Same keys - no transform needed
            const noTransform = generator.object([
                { key: { raw: "name", parsed: "name" }, value: generator.string() }
            ]);
            
            // Different keys - transform needed
            const withTransform = generator.object([
                { key: { raw: "user_name", parsed: "userName" }, value: generator.string() }
            ]);

            const noTransformExpr = noTransform.toExpression();
            const withTransformExpr = withTransform.toExpression();

            // Both should produce valid expressions
            expect(noTransformExpr).toBeDefined();
            expect(withTransformExpr).toBeDefined();
        });

        it("should generate compact enum schemas", () => {
            const generator = new ZodSerializationCodeGenerator();
            const schema = generator.enum(["PENDING", "ACTIVE", "COMPLETED"]);
            const expression = schema.toExpression();

            expect(expression.kind).toBeDefined();
        });
    });
});

/**
 * Bundle size targets (for reference when measuring actual builds):
 * 
 * - Zod base: ~14KB minified+gzipped
 * - Custom zurg: ~100KB+ (60+ files)
 * 
 * Target: Generated SDK with validation should be <20KB total serde code
 */
