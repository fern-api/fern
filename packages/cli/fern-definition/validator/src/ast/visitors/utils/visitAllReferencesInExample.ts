import { isPlainObject } from "@fern-api/core-utils";
import { EXAMPLE_REFERENCE_PREFIX, NodePath } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "../../DefinitionFileAstVisitor";

/**
 * Checks if a string is a valid example reference format.
 * Example references must be in the format $Type.Example or $import.Type.Example,
 * where Type and import names must start with a letter.
 * This ensures strings like "$3.00" are not treated as example references.
 */
function isValidExampleReference(example: string): boolean {
    if (!example.startsWith(EXAMPLE_REFERENCE_PREFIX)) {
        return false;
    }

    const parts = example.split(".");
    if (parts.length < 2 || parts.length > 3) {
        return false;
    }

    // Get the first identifier (after the $ prefix)
    const firstPart = parts[0]?.slice(EXAMPLE_REFERENCE_PREFIX.length);
    if (!firstPart || !startsWithLetter(firstPart)) {
        return false;
    }

    // For $import.Type.Example format, check the second part too
    if (parts.length === 3) {
        const secondPart = parts[1];
        if (!secondPart || !startsWithLetter(secondPart)) {
            return false;
        }
    }

    return true;
}

function startsWithLetter(str: string): boolean {
    if (str.length === 0) {
        return false;
    }
    const firstChar = str.charAt(0);
    return (firstChar >= "a" && firstChar <= "z") || (firstChar >= "A" && firstChar <= "Z");
}

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
        if (isValidExampleReference(example)) {
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
