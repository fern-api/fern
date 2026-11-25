import { isMdxJsxAttribute } from "@fern-api/docs-markdown-utils";
import { FernNavigation } from "@fern-api/fdr-sdk";
import type { Node as EstreeNode } from "estree";
import { walk } from "estree-walker";
import type { Node as UnistNode } from "unist";

type MdxJsxAttributeOrExpression = Parameters<typeof isMdxJsxAttribute>[0];
type MdxJsxAttribute = Extract<MdxJsxAttributeOrExpression, { type: "mdxJsxAttribute" }>;
type MdxJsxAttributeValueExpression = Exclude<MdxJsxAttribute["value"], string | null | undefined>;

/**
 * The version/product condition of an enclosing `<If>` block. Links inside the block are only
 * rendered on pages whose version/product satisfies every enclosing gate.
 */
export interface IfGate {
    versions?: string[];
    products?: string[];
    not: boolean;
}

/**
 * The names a page's version and product can be referenced by in `<If versions>` / `<If products>`:
 * the id, the display-name, and the last slug fragment (mirrors the docs renderer's `evaluateIf`).
 */
export interface PageScope {
    versionNames: string[];
    productNames: string[];
}

export function getPageScope(parents: readonly FernNavigation.NavigationNodeParent[]): PageScope {
    const versionNames: string[] = [];
    const productNames: string[] = [];
    for (const parent of parents) {
        if (parent.type === "version") {
            versionNames.push(parent.versionId, parent.title, getLastSlugFragment(getConfiguredSlug(parent)));
        } else if (parent.type === "product") {
            productNames.push(parent.productId, parent.title, getLastSlugFragment(getConfiguredSlug(parent)));
        }
    }
    return { versionNames: versionNames.filter(Boolean), productNames: productNames.filter(Boolean) };
}

/**
 * The default version is also served without its slug segment, and that pruned copy keeps the
 * original slug in `canonicalSlug`. Use the original so the default version isn't named after the
 * site or product prefix.
 */
function getConfiguredSlug(node: { slug: string; canonicalSlug?: string }): string {
    return node.canonicalSlug ?? node.slug;
}

function getLastSlugFragment(slug: string): string {
    return slug.split("/").filter(Boolean).pop() ?? "";
}

/**
 * Reads the version/product gate of an `<If>` element. Returns undefined when the element has no
 * versions/products condition. `fern check` cannot evaluate roles/login, so an `<If>` that also
 * gates on them keeps its versions/products gate only when it can hide content regardless of the
 * viewer (i.e. without `not`).
 */
export function parseIfGate(attributes: MdxJsxAttributeOrExpression[]): IfGate | undefined {
    const jsxAttributes = attributes.filter(isMdxJsxAttribute);
    const getAttribute = (name: string) => jsxAttributes.find((attribute) => attribute.name === name);

    const versions = extractStringList(getAttribute("versions")?.value);
    const products = extractStringList(getAttribute("products")?.value);
    if ((versions == null || versions.length === 0) && (products == null || products.length === 0)) {
        return undefined;
    }

    const not = isTruthyFlag(getAttribute("not"));
    const gatesOnViewer =
        getAttribute("roles") != null || getAttribute("viewer") != null || getAttribute("loggedIn") != null;
    if (gatesOnViewer && not) {
        return undefined;
    }

    return { versions, products, not };
}

/**
 * Maps every node nested inside one or more `<If>` elements to the gates of its enclosing `<If>`s.
 */
export function collectIfGatesByNode(tree: UnistNode, inheritedGates: IfGate[]): Map<UnistNode, IfGate[]> {
    const gatesByNode = new Map<UnistNode, IfGate[]>();
    const visitNode = (node: UnistNode, gates: IfGate[]): void => {
        if (gates.length > 0) {
            gatesByNode.set(node, gates);
        }
        let childGates = gates;
        if (isIfElement(node)) {
            const gate = parseIfGate(node.attributes);
            if (gate != null) {
                childGates = [...gates, gate];
            }
        }
        if ("children" in node && Array.isArray(node.children)) {
            for (const child of node.children as UnistNode[]) {
                visitNode(child, childGates);
            }
        }
    };
    visitNode(tree, inheritedGates);
    return gatesByNode;
}

function isIfElement(node: UnistNode): node is UnistNode & { name: string; attributes: MdxJsxAttributeOrExpression[] } {
    return (
        (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
        "name" in node &&
        node.name === "If" &&
        "attributes" in node &&
        Array.isArray(node.attributes)
    );
}

export function isVisibleInScope(gates: IfGate[] | undefined, scope: PageScope | undefined): boolean {
    if (gates == null || gates.length === 0) {
        return true;
    }
    const versionNames = scope?.versionNames ?? [];
    const productNames = scope?.productNames ?? [];
    return gates.every((gate) => {
        const productMatches =
            gate.products == null ||
            gate.products.length === 0 ||
            gate.products.some((name) => productNames.includes(name));
        const versionMatches =
            gate.versions == null ||
            gate.versions.length === 0 ||
            gate.versions.some((name) => versionNames.includes(name));
        const shown = productMatches && versionMatches;
        return gate.not ? !shown : shown;
    });
}

function isTruthyFlag(attribute: MdxJsxAttribute | undefined): boolean {
    if (attribute == null) {
        return false;
    }
    // `<If not>` has a null value
    if (attribute.value == null) {
        return true;
    }
    // the docs renderer passes string props through as-is, so any non-empty string is truthy
    if (typeof attribute.value === "string") {
        return attribute.value !== "";
    }
    const literals = extractLiterals(attribute.value);
    return literals.length === 1 && literals[0] === true;
}

function extractStringList(value: string | MdxJsxAttributeValueExpression | null | undefined): string[] | undefined {
    if (value == null) {
        return undefined;
    }
    if (typeof value === "string") {
        return [value];
    }
    const literals = extractLiterals(value);
    const strings = literals.filter((literal): literal is string => typeof literal === "string");
    return strings.length > 0 ? strings : undefined;
}

function extractLiterals(value: MdxJsxAttributeValueExpression): unknown[] {
    const estree: EstreeNode | undefined = value.data?.estree ?? undefined;
    if (estree == null) {
        return [];
    }
    const literals: unknown[] = [];
    walk(estree, {
        enter(node) {
            if (node.type === "Literal") {
                literals.push(node.value);
            } else if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
                literals.push(node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join(""));
                this.skip();
            }
        }
    });
    return literals;
}
