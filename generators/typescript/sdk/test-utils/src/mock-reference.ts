import type { Reference } from "@fern-typescript/commons";
import { ts } from "ts-morph";

/**
 * Creates a mock Reference with getExpression, getTypeNode, and getEntityName.
 * Used across schema generators, error generators, and endpoint error union tests.
 */
export function createMockReference(name: string): Reference {
    return {
        getExpression: () => ts.factory.createIdentifier(name),
        getTypeNode: () => ts.factory.createTypeReferenceNode(name),
        getEntityName: () => ts.factory.createIdentifier(name)
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal Reference interface
    } as any;
}
