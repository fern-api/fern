import { isMdxJsxAttribute, isMdxJsxElement, parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import type { Node as EstreeNode } from "estree";
import { visit } from "unist-util-visit";

const ROLE_ATTRIBUTE_NAMES = new Set(["roles", "viewer"]);

/**
 * The role IDs that `<If roles={[...]}>` / `<If viewer={[...]}>` blocks reference, read the same way the
 * renderer reads them: only an array lists roles. The renderer treats a plain string (`viewer="beta"`) or a
 * single literal (`roles={"beta"}`) as an empty list, and dynamic values can't be resolved statically, so
 * both are skipped.
 */
export function collectIfRoles(content: string): string[] {
    // Skips the MDX parse for pages with no `<If`; also matches e.g. `<Iframe`, which only costs a parse.
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
            if (value == null || typeof value === "string") {
                continue;
            }
            for (const role of readArrayStrings(value.data?.estree)) {
                roles.add(role);
            }
        }
    });
    return [...roles];
}

function readArrayStrings(estree: EstreeNode | null | undefined): string[] {
    if (estree?.type !== "Program") {
        return [];
    }
    const statement = estree.body[0];
    if (estree.body.length !== 1 || statement?.type !== "ExpressionStatement") {
        return [];
    }
    const expression = statement.expression;
    if (expression.type !== "ArrayExpression") {
        return [];
    }
    return expression.elements.flatMap((element) =>
        element?.type === "Literal" && typeof element.value === "string" ? [element.value] : []
    );
}
