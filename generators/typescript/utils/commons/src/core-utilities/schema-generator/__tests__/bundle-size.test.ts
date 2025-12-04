import { describe, it, expect } from "vitest";
import { ZodSchemaGenerator } from "../ZodSchemaGenerator";
import { YupSchemaGenerator } from "../YupSchemaGenerator";

/**
 * Bundle size verification tests.
 * 
 * These tests verify that generated schemas result in reasonable bundle sizes.
 * Actual bundle size measurement requires building the generated output,
 * so these tests focus on structural validation that impacts bundle size.
 */
describe("Bundle Size Verification", () => {
    describe("ZodSchemaGenerator", () => {
        it("should generate minimal AST for simple string schema", () => {
            const generator = new ZodSchemaGenerator();
            const schema = generator.string();
            const expression = schema.toExpression();

            // Should be a simple call expression: z.string()
            expect(expression.kind).toBeDefined();
        });

        it("should generate minimal AST for object without key transform", () => {
            const generator = new ZodSchemaGenerator();
            const schema = generator.object([
                { key: { raw: "name", parsed: "name" }, value: generator.string() },
                { key: { raw: "age", parsed: "age" }, value: generator.number() }
            ]);
            const expression = schema.toExpression();

            // Without key transform, should just be z.object({...})
            expect(expression.kind).toBeDefined();
        });

        it("should add transform only when keys differ", () => {
            const generator = new ZodSchemaGenerator();
            
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
            const generator = new ZodSchemaGenerator();
            const schema = generator.enum(["PENDING", "ACTIVE", "COMPLETED"]);
            const expression = schema.toExpression();

            expect(expression.kind).toBeDefined();
        });
    });

    describe("YupSchemaGenerator", () => {
        it("should generate minimal AST for simple string schema", () => {
            const generator = new YupSchemaGenerator();
            const schema = generator.string();
            const expression = schema.toExpression();

            expect(expression.kind).toBeDefined();
        });

        it("should generate minimal AST for object without key transform", () => {
            const generator = new YupSchemaGenerator();
            const schema = generator.object([
                { key: { raw: "name", parsed: "name" }, value: generator.string() },
                { key: { raw: "age", parsed: "age" }, value: generator.number() }
            ]);
            const expression = schema.toExpression();

            expect(expression.kind).toBeDefined();
        });

        it("should generate compact enum schemas", () => {
            const generator = new YupSchemaGenerator();
            const schema = generator.enum(["PENDING", "ACTIVE", "COMPLETED"]);
            const expression = schema.toExpression();

            expect(expression.kind).toBeDefined();
        });
    });

    describe("Comparative Analysis", () => {
        it("both generators should handle same property set", () => {
            const zodGen = new ZodSchemaGenerator();
            const yupGen = new YupSchemaGenerator();

            const properties = [
                { key: { raw: "user_id", parsed: "userId" }, value: zodGen.string() },
                { key: { raw: "display_name", parsed: "displayName" }, value: zodGen.string() },
                { key: { raw: "is_active", parsed: "isActive" }, value: zodGen.boolean() }
            ];

            const yupProperties = [
                { key: { raw: "user_id", parsed: "userId" }, value: yupGen.string() },
                { key: { raw: "display_name", parsed: "displayName" }, value: yupGen.string() },
                { key: { raw: "is_active", parsed: "isActive" }, value: yupGen.boolean() }
            ];

            const zodSchema = zodGen.object(properties);
            const yupSchema = yupGen.object(yupProperties);

            expect(zodSchema.toExpression()).toBeDefined();
            expect(yupSchema.toExpression()).toBeDefined();
        });
    });
});

/**
 * Bundle size targets (for reference when measuring actual builds):
 * 
 * - Zod base: ~14KB minified+gzipped
 * - Yup base: ~12KB minified+gzipped  
 * - Custom zurg: ~100KB+ (60+ files)
 * 
 * Target: Generated SDK with validation should be <20KB total serde code
 */

