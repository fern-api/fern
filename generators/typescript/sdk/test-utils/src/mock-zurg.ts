import type { Zurg } from "@fern-typescript/commons";
import { ts } from "ts-morph";

/**
 * Creates a minimal Zurg.Schema mock that returns an expression for serialization.
 * Used across type-schema-generator, sdk-error-schema-generator, sdk-endpoint-type-schemas-generator,
 * sdk-inlined-request-body-schema-generator, websocket-type-schema-generator, and type-reference-converters.
 */
export function createMockZurgSchema(exprText: string): Zurg.Schema {
    const base: Zurg.BaseSchema = {
        isOptional: false,
        isNullable: false,
        toExpression: () => ts.factory.createIdentifier(exprText)
    };
    return {
        ...base,
        parse: (raw: ts.Expression) => raw,
        json: (parsed: ts.Expression) => parsed,
        parseOrThrow: (raw: ts.Expression) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(exprText), "parseOrThrow"),
                undefined,
                [raw]
            ),
        jsonOrThrow: (parsed: ts.Expression) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(exprText), "jsonOrThrow"),
                undefined,
                [parsed]
            ),
        nullable: () => createMockZurgSchema(`${exprText}.nullable()`),
        optional: () => createMockZurgSchema(`${exprText}.optional()`),
        optionalNullable: () => createMockZurgSchema(`${exprText}.optionalNullable()`),
        transform: () => createMockZurgSchema(`${exprText}.transform()`)
        // biome-ignore lint/suspicious/noExplicitAny: test mock for Zurg.Schema interface
    } as any;
}

/**
 * Creates a Zurg.ObjectSchema mock that extends the base Zurg.Schema with object-specific methods.
 * Used across type-schema-generator, sdk-endpoint-type-schemas-generator,
 * and sdk-inlined-request-body-schema-generator.
 */
export function createMockZurgObjectSchema(exprText: string): Zurg.ObjectSchema {
    const base = createMockZurgSchema(exprText);
    return {
        ...base,
        withParsedProperties: () => createMockZurgObjectSchema(`${exprText}.withParsedProperties()`),
        extend: () => createMockZurgObjectSchema(`${exprText}.extend()`),
        passthrough: () => createMockZurgObjectSchema(`${exprText}.passthrough()`)
        // biome-ignore lint/suspicious/noExplicitAny: test mock for Zurg.ObjectSchema interface
    } as any;
}
