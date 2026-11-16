import { isMdxJsxAttribute, isMdxJsxElement, parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import type { Node as EstreeNode } from "estree";
import { visit } from "unist-util-visit";

const ROLE_ATTRIBUTE_NAMES = new Set(["roles", "viewer"]);

/**
 * The role IDs that `<If roles={[...]}>` / `<If viewer={[...]}>` blocks reference, read the same way the
 * renderer reads them: a static array of string literals (or a single string literal). Dynamic values
 * can't be resolved statically, so they are skipped.
 */
export function collectIfRoles(content: string): string[] {
    if (!content.includes("<If")) {
        return [];
    }
    let tree: ReturnType<typeof parseMarkdownToTree>;
    try {
        tree = parseMarkdownToTree(content);
    } catch {
        // Unparseable MDX is reported by `valid-markdown`.
        return [];
    }
    const roles = new Set<string>();
    visit(tree, (node) => {
        if (!isMdxJsxElement(node) || node.name !== "If") {
            return;
        }
        for (const attribute of node.attributes) {
            if (!isMdxJsxAttribute(attribute) || !ROLE_ATTRIBUTE_NAMES.has(attribute.name)) {
                continue;
            }
            const value = attribute.value;
            if (typeof value === "string") {
                roles.add(value);
            } else if (value != null) {
                for (const role of readStaticStrings(value.data?.estree)) {
                    roles.add(role);
                }
            }
        }
    });
    return [...roles];
}

function readStaticStrings(estree: EstreeNode | null | undefined): string[] {
    if (estree?.type !== "Program") {
        return [];
    }
    const statement = estree.body[0];
    if (estree.body.length !== 1 || statement?.type !== "ExpressionStatement") {
        return [];
    }
    const expression = statement.expression;
    if (expression.type === "Literal") {
        return typeof expression.value === "string" ? [expression.value] : [];
    }
    if (expression.type === "ArrayExpression") {
        return expression.elements.flatMap((element) =>
            element?.type === "Literal" && typeof element.value === "string" ? [element.value] : []
        );
    }
    return [];
}
