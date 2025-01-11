import { isPlainObject } from "@fern-api/core-utils";
import { EXAMPLE_REFERENCE_PREFIX, NodePath } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "../../DefinitionFileAstVisitor";

export function visitAllReferencesInExample({
    example,
    visitor,
    nodePath
}: {
    example: unknown;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}): void {
    if (typeof example === "string") {
        if (example.startsWith(EXAMPLE_REFERENCE_PREFIX)) {
            visitor.exampleTypeReference?.(example, nodePath);
        }
    } else if (isPlainObject(example)) {
        for (const exampleValue of Object.values(example)) {
            visitAllReferencesInExample({
                example: exampleValue,
                visitor,
                nodePath
            });
        }
    } else if (Array.isArray(example)) {
        for (const exampleItem of example) {
            visitAllReferencesInExample({
                example: exampleItem,
                visitor,
                nodePath
            });
        }
    }
}
