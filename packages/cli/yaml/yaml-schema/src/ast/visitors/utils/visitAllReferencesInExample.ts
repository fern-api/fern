import { isPlainObject } from "@fern-api/core-utils";
import { EXAMPLE_REFERENCE_PREFIX } from "../../../constants";
import { FernServiceFileAstVisitor } from "../../FernServiceFileAstVisitor";
import { NodePath } from "../../NodePath";

export async function visitAllReferencesInExample({
    example,
    visitor,
    nodePath,
}: {
    example: unknown;
    visitor: Partial<FernServiceFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    if (typeof example === "string") {
        if (example.startsWith(EXAMPLE_REFERENCE_PREFIX)) {
            await visitor.exampleTypeReference?.(example, nodePath);
        }
    } else if (isPlainObject(example)) {
        for (const exampleValue in Object.values(example)) {
            await visitAllReferencesInExample({
                example: exampleValue,
                visitor,
                nodePath,
            });
        }
    } else if (Array.isArray(example)) {
        for (const exampleItem of example) {
            await visitAllReferencesInExample({
                example: exampleItem,
                visitor,
                nodePath,
            });
        }
    }
}
